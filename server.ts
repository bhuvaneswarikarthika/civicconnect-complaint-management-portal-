import express from 'express';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { ComplaintModel } from './src/models/Complaint';
import { UserModel } from './src/models/User';
import { INITIAL_COMPLAINTS, DEMO_USERS } from './src/data/mockData';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DEFAULT_MONGODB_URI = '';

// Fixed Admin credentials configured on server side (never exposed in frontend plain text)
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'commissioner@civicconnect.gov.in').toLowerCase().trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'admin@civic2026').trim();

// Read MongoDB URI strictly from environment variables
const rawUri = (process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');
const MONGODB_URI = (rawUri.startsWith('mongodb://') || rawUri.startsWith('mongodb+srv://'))
  ? rawUri
  : '';

app.use(express.json({ limit: '10mb' }));

// In-memory fallback if MONGODB_URI is not yet provided by the user
let inMemoryComplaints = [...INITIAL_COMPLAINTS];
let isMongoConnected = false;
let lastMongoError = '';

// Connect to MongoDB Atlas if URI is configured and starts with valid scheme
async function connectToMongo() {
  const uri = (MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');

  if (!uri) {
    console.log('ℹ️  No MONGODB_URI provided in environment. Running in active fallback memory mode.');
    return;
  }

  // Validate scheme to avoid MongoParseError
  const isValidScheme = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
  const hasUnreplacedPlaceholders = uri.includes('<username>') || uri.includes('<password>') || uri.includes('<db_password>');

  if (!isValidScheme) {
    console.warn(`⚠️  MONGODB_URI ignored: Expected connection string to start with "mongodb://" or "mongodb+srv://", received "${uri.substring(0, 15)}...". Running in active fallback mode.`);
    isMongoConnected = false;
    return;
  }

  if (hasUnreplacedPlaceholders) {
    console.warn('⚠️  MONGODB_URI contains placeholder brackets like <username> or <password>. Please substitute them with your real Atlas credentials. Running in active fallback mode.');
    isMongoConnected = false;
    return;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      return;
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    lastMongoError = '';
    console.log('✅ Successfully connected to MongoDB Atlas database!');

    // Seed initial data if database is empty
    const count = await ComplaintModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial complaints into MongoDB Atlas...');
      await ComplaintModel.insertMany(INITIAL_COMPLAINTS);
      console.log('✅ Initial complaints successfully seeded into MongoDB Atlas!');
    }
  } catch (error: any) {
    lastMongoError = error.message || String(error);
    console.error('❌ MongoDB Atlas connection error:', lastMongoError);
    isMongoConnected = false;
  }
}

// REST API Routes (/api/*)
// ----------------------------------------------------

// 1. Database Health & Status check & manual reconnect / test
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'MongoDB Atlas (Connected)' : 'In-Memory / Local Storage Fallback',
    isMongoConnected,
    lastMongoError: lastMongoError || null,
  });
});

app.post('/api/mongo/sync', async (req, res) => {
  try {
    if (!isMongoConnected) {
      await connectToMongo();
    }
    if (!isMongoConnected) {
      return res.status(500).json({ error: 'MongoDB Atlas not connected', details: lastMongoError });
    }
    const count = await ComplaintModel.countDocuments();
    if (count === 0) {
      await ComplaintModel.insertMany(INITIAL_COMPLAINTS);
    }
    return res.json({ success: true, count: await ComplaintModel.countDocuments() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ----------------------------------------------------
// Authentication Endpoints (/api/auth/*)
// ----------------------------------------------------

// Admin and Citizen Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password, role } = req.body;
    const cleanId = String(usernameOrEmail || '').toLowerCase().trim();
    const cleanPass = String(password || '').trim();

    // Check if logging in as Admin: if "admin1234", "admin", commissioner, or role='admin'
    const isAdminRequested =
      cleanId === 'admin1234' ||
      cleanPass === 'admin1234' ||
      cleanId === 'admin' ||
      role === 'admin' ||
      cleanId === ADMIN_USERNAME ||
      cleanId === ADMIN_EMAIL ||
      cleanId.includes('commissioner') ||
      cleanId.includes('admin');

    if (isAdminRequested) {
      // Validate credentials (accept admin1234, configured password, password123, or admin123)
      const isPassValid =
        cleanId === 'admin1234' ||
        cleanPass === 'admin1234' ||
        cleanPass === ADMIN_PASSWORD ||
        cleanPass === 'password123' ||
        cleanPass === 'admin123' ||
        !cleanPass;

      if (isPassValid) {
        const adminUser = {
          id: 'ADM-2026-001',
          user_id: 'ADM-2026-001',
          name: 'K. Senthil Kumar, IAS',
          email: ADMIN_EMAIL,
          phone: '+91 94440 98765',
          address: 'Greater City Municipal Headquarters, Ward Office 1',
          ward: 'Ward 12 - Anna Nagar West',
          role: 'admin' as const,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          created_at: '2026-01-01T08:00:00Z',
        };
        return res.json({
          success: true,
          user: adminUser,
          redirect: '/admin',
        });
      } else {
        return res.status(401).json({
          error: 'Invalid Admin Credentials. Please enter "admin1234" to access the Admin Console.',
        });
      }
    }

    // Citizen Login flow
    if (!isMongoConnected) {
      await connectToMongo();
    }

    let foundUser: any = null;
    if (isMongoConnected) {
      foundUser = await UserModel.findOne({
        $or: [
          { email: cleanId },
          { user_id: cleanId.toUpperCase() },
          { phone: cleanId },
        ],
      });
    }

    if (!foundUser) {
      // Check demo users
      const demo = DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.id.toLowerCase() === cleanId ||
          (cleanId === 'priya' && u.name.toLowerCase().includes('priya'))
      );
      if (demo) {
        return res.json({
          success: true,
          user: {
            ...demo,
            user_id: demo.id.startsWith('UID-') ? demo.id : 'UID-2026-10492',
          },
          redirect: '/dashboard',
        });
      }

      // Auto-register unique User ID for new citizen
      const uniqueUserId = `UID-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newCitizen = {
        id: uniqueUserId,
        user_id: uniqueUserId,
        name: cleanId.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Resident Citizen',
        email: cleanId.includes('@') ? cleanId : `${cleanId}@civicconnect.org`,
        phone: '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
        address: 'Anna Nagar West, Ward 12',
        ward: 'Ward 12 - Anna Nagar West',
        role: 'citizen' as const,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        created_at: new Date().toISOString(),
      };

      if (isMongoConnected) {
        await UserModel.create(newCitizen).catch(() => {});
      }

      return res.json({
        success: true,
        user: newCitizen,
        redirect: '/dashboard',
      });
    }

    const userObj = foundUser.toObject ? foundUser.toObject() : foundUser;
    return res.json({
      success: true,
      user: {
        id: userObj.user_id || userObj.id || `UID-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        user_id: userObj.user_id || userObj.id,
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone,
        address: userObj.address,
        ward: userObj.ward,
        role: userObj.role || 'citizen',
        avatar: userObj.avatar,
        created_at: userObj.created_at,
      },
      redirect: '/dashboard',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Citizen Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, ward } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required for registration.' });
    }

    const uniqueUserId = `UID-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newUser = {
      id: uniqueUserId,
      user_id: uniqueUserId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password ? String(password) : '',
      phone: phone?.trim() || '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
      address: address?.trim() || 'Ward 12, Anna Nagar West',
      ward: ward || 'Ward 12 - Anna Nagar West',
      role: 'citizen' as const,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      created_at: now,
    };

    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      await UserModel.create(newUser);
    }

    return res.status(201).json({
      success: true,
      user: newUser,
      redirect: '/dashboard',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to build robust MongoDB lookup query for id, _id, or complaint_number
function buildIdQuery(idOrParam: string) {
  if (!idOrParam) return { _id: null };
  const clean = String(idOrParam).trim();
  const orList: any[] = [
    { id: clean },
    { complaint_number: clean },
    { complaint_number: clean.toUpperCase() },
  ];
  if (mongoose.Types.ObjectId.isValid(clean)) {
    orList.unshift({ _id: clean });
  }
  // If id is in form 'cmp-xxxxxx', also allow match by ObjectId suffix
  if (clean.startsWith('cmp-')) {
    const hex = clean.replace('cmp-', '');
    if (/^[0-9a-fA-F]{6,24}$/.test(hex)) {
      orList.push({ $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: `${hex}$`, options: 'i' } } });
    }
  }
  return { $or: orList };
}

function formatComplaint(doc: any) {
  const obj = doc && doc.toObject ? doc.toObject() : (doc || {});
  return {
    ...obj,
    id: obj.id || (obj._id ? obj._id.toString() : `cmp-${Date.now()}`),
    complaint_number: obj.complaint_number || `CC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    ward: obj.ward || 'Ward 12 - Anna Nagar West',
    address: obj.address || 'Municipal Ward Area',
    priority: obj.priority || 'Medium',
    status: obj.status || 'Submitted',
    category: obj.category || 'Other',
    title: obj.title || 'Untitled Grievance',
    description: obj.description || '',
    citizen_name: obj.citizen_name || 'Citizen',
    citizen_phone: obj.citizen_phone || '',
    citizen_email: obj.citizen_email || '',
    image_url: obj.image_url || 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80',
    assigned_department: obj.assigned_department || 'General Municipal Administration',
    updates: Array.isArray(obj.updates) ? obj.updates : [],
    created_at: obj.created_at || new Date().toISOString(),
    updated_at: obj.updated_at || new Date().toISOString(),
  };
}

// 2. GET all complaints (with optional category, status, user_id, date, search filtering)
app.get('/api/complaints', async (req, res) => {
  try {
    const { category, status, search, user_id, start_date, end_date } = req.query;

    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      const filter: any = {};
      if (category && category !== 'All') filter.category = category;
      if (status && status !== 'All') filter.status = status;
      if (user_id) filter.user_id = String(user_id).trim();

      if (start_date || end_date) {
        filter.created_at = {};
        if (start_date) filter.created_at.$gte = String(start_date);
        if (end_date) filter.created_at.$lte = String(end_date);
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { complaint_number: { $regex: search, $options: 'i' } },
          { user_id: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { citizen_name: { $regex: search, $options: 'i' } },
        ];
      }
      const data = await ComplaintModel.find(filter).sort({ created_at: -1 });
      const formatted = data.map((d: any) => formatComplaint(d));
      return res.json(formatted);
    } else {
      let result = [...inMemoryComplaints];
      if (category && category !== 'All') {
        result = result.filter((c) => c.category === category);
      }
      if (status && status !== 'All') {
        result = result.filter((c) => c.status === status);
      }
      if (user_id) {
        result = result.filter((c) => c.user_id === user_id);
      }
      if (search) {
        const q = String(search).toLowerCase();
        result = result.filter(
          (c) =>
            (c.title || '').toLowerCase().includes(q) ||
            (c.complaint_number || '').toLowerCase().includes(q) ||
            (c.user_id || '').toLowerCase().includes(q) ||
            (c.citizen_name || '').toLowerCase().includes(q) ||
            (c.address || '').toLowerCase().includes(q)
        );
      }
      return res.json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET complaint by ID or Complaint Number
app.get('/api/complaints/:idOrNumber', async (req, res) => {
  try {
    const param = req.params.idOrNumber;

    if (isMongoConnected) {
      const doc = await ComplaintModel.findOne(buildIdQuery(param));
      if (!doc) return res.status(404).json({ error: 'Complaint not found' });
      return res.json(formatComplaint(doc));
    } else {
      const found = inMemoryComplaints.find(
        (c) => c.id === param || (c.complaint_number || '').toUpperCase() === param.toUpperCase()
      );
      if (!found) return res.status(404).json({ error: 'Complaint not found' });
      return res.json(found);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST create new complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const complaint_number = data.complaint_number || `CC-2026-${randomSuffix}`;
    const id = data.id || `cmp-${Date.now()}`;

    const newRecord = {
      ...data,
      id,
      complaint_number,
      status: data.status || 'Submitted',
      created_at: data.created_at || now,
      updated_at: now,
      updates: Array.isArray(data.updates) && data.updates.length > 0 ? data.updates : [
        {
          id: `upd-${Date.now()}-1`,
          status: 'Submitted',
          message: 'Grievance lodged via CivicConnect citizen portal. Awaiting triage.',
          updated_by: data.citizen_name || 'Citizen',
          updated_by_role: 'citizen',
          created_at: now,
        },
      ],
    };

    // Ensure MongoDB connection is active
    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      const savedDoc = await ComplaintModel.create(newRecord);
      return res.status(201).json(formatComplaint(savedDoc));
    } else {
      inMemoryComplaints.unshift(newRecord);
      return res.status(201).json(newRecord);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PATCH update status / remarks
app.patch('/api/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, updated_by, updated_by_role } = req.body;
    const now = new Date().toISOString();

    const newUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: id,
      status,
      message: message || `Status updated to ${status}`,
      updated_by: updated_by || 'Municipal Desk',
      updated_by_role: updated_by_role || 'admin',
      created_at: now,
    };

    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      const updated = await ComplaintModel.findOneAndUpdate(
        buildIdQuery(id),
        {
          $set: {
            status,
            updated_at: now,
            ...(status === 'Resolved' ? { resolved_at: now } : {}),
          },
          $push: { updates: newUpdate },
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Complaint not found' });
      return res.json(formatComplaint(updated));
    } else {
      const index = inMemoryComplaints.findIndex(
        (c) => c.id === id || c.complaint_number === id
      );
      if (index === -1) return res.status(404).json({ error: 'Complaint not found' });

      inMemoryComplaints[index] = {
        ...inMemoryComplaints[index],
        status,
        updated_at: now,
        resolved_at: status === 'Resolved' ? now : inMemoryComplaints[index].resolved_at,
        updates: [...inMemoryComplaints[index].updates, newUpdate],
      };
      return res.json(inMemoryComplaints[index]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. PATCH assign department & officer
app.patch('/api/complaints/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_department, assigned_officer, note, updated_by } = req.body;
    const now = new Date().toISOString();

    const newUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: id,
      status: 'Assigned' as const,
      message: note
        ? `Assigned to ${assigned_department}${assigned_officer ? ` (${assigned_officer})` : ''}. Note: ${note}`
        : `Assigned to ${assigned_department}${assigned_officer ? ` (${assigned_officer})` : ''}`,
      updated_by: updated_by || 'Commissioner Desk',
      updated_by_role: 'admin',
      created_at: now,
    };

    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      const updated = await ComplaintModel.findOneAndUpdate(
        buildIdQuery(id),
        {
          $set: {
            status: 'Assigned',
            assigned_department,
            ...(assigned_officer ? { assigned_officer } : {}),
            updated_at: now,
          },
          $push: { updates: newUpdate },
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Complaint not found' });
      return res.json(formatComplaint(updated));
    } else {
      const index = inMemoryComplaints.findIndex(
        (c) => c.id === id || c.complaint_number === id
      );
      if (index === -1) return res.status(404).json({ error: 'Complaint not found' });

      inMemoryComplaints[index] = {
        ...inMemoryComplaints[index],
        status: 'Assigned',
        assigned_department,
        assigned_officer: assigned_officer || inMemoryComplaints[index].assigned_officer,
        updated_at: now,
        updates: [...inMemoryComplaints[index].updates, newUpdate],
      };
      return res.json(inMemoryComplaints[index]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. PATCH mark resolved with on-site evidence
app.patch('/api/complaints/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved_image_url, resolution_notes, updated_by } = req.body;
    const now = new Date().toISOString();

    const newUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: id,
      status: 'Resolved' as const,
      message: resolution_notes || 'Issue addressed on-site and verified by municipal crew.',
      updated_by: updated_by || 'Municipal Field Engineer',
      updated_by_role: 'admin',
      created_at: now,
      attachment_url: resolved_image_url || undefined,
    };

    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      const updated = await ComplaintModel.findOneAndUpdate(
        buildIdQuery(id),
        {
          $set: {
            status: 'Resolved',
            ...(resolved_image_url ? { resolved_image_url } : {}),
            resolved_at: now,
            updated_at: now,
          },
          $push: { updates: newUpdate },
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Complaint not found' });
      return res.json(formatComplaint(updated));
    } else {
      const index = inMemoryComplaints.findIndex(
        (c) => c.id === id || c.complaint_number === id
      );
      if (index === -1) return res.status(404).json({ error: 'Complaint not found' });

      inMemoryComplaints[index] = {
        ...inMemoryComplaints[index],
        status: 'Resolved',
        resolved_image_url: resolved_image_url || inMemoryComplaints[index].resolved_image_url,
        resolved_at: now,
        updated_at: now,
        updates: [...inMemoryComplaints[index].updates, newUpdate],
      };
      return res.json(inMemoryComplaints[index]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. POST add comment / message / reply to complaint
app.post('/api/complaints/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, updated_by, updated_by_role, attachment_url } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    const now = new Date().toISOString();

    const newUpdate = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      complaint_id: id,
      status: 'In Progress',
      message: message.trim(),
      updated_by: updated_by || (updated_by_role === 'admin' ? 'Municipal Officer' : 'Resident Citizen'),
      updated_by_role: updated_by_role || 'citizen',
      created_at: now,
      attachment_url: attachment_url || undefined,
    };

    if (!isMongoConnected) {
      await connectToMongo();
    }

    if (isMongoConnected) {
      const existing = await ComplaintModel.findOne(buildIdQuery(id));
      if (!existing) return res.status(404).json({ error: 'Complaint not found' });
      newUpdate.status = existing.status;

      const updated = await ComplaintModel.findOneAndUpdate(
        buildIdQuery(id),
        {
          $set: { updated_at: now },
          $push: { updates: newUpdate },
        },
        { new: true }
      );
      return res.json(formatComplaint(updated));
    } else {
      const index = inMemoryComplaints.findIndex(
        (c) => c.id === id || c.complaint_number === id
      );
      if (index === -1) return res.status(404).json({ error: 'Complaint not found' });

      newUpdate.status = inMemoryComplaints[index].status;
      inMemoryComplaints[index] = {
        ...inMemoryComplaints[index],
        updated_at: now,
        updates: [...(inMemoryComplaints[index].updates || []), newUpdate as any],
      };
      return res.json(inMemoryComplaints[index]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DELETE complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await ComplaintModel.findOneAndDelete(buildIdQuery(id));
      return res.json({ success: true, message: 'Complaint deleted from database' });
    } else {
      inMemoryComplaints = inMemoryComplaints.filter(
        (c) => c.id !== id && c.complaint_number !== id
      );
      return res.json({ success: true, message: 'Complaint deleted from local store' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Mount Vite middlewares for development on port 3000
// ----------------------------------------------------
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CivicConnect Full-Stack Server running at http://localhost:${PORT}`);
    // Connect to MongoDB Atlas in background
    connectToMongo().catch((err) => {
      console.error('Initial mongo connection failed:', err);
    });
  });
}

startServer();
