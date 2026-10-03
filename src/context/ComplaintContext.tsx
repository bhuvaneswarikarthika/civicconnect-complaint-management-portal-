import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  ComplaintUpdate,
  CivicStats,
} from '../types';
import { INITIAL_COMPLAINTS } from '../data/mockData';
import { civicApi } from '../services/api';
import { normalizeComplaint } from '../utils/normalizeComplaint';

interface ComplaintContextType {
  complaints: Complaint[];
  stats: CivicStats;
  dbStatus: { status: string; database: string; mongoConfigured: boolean };
  addComplaint: (
    data: Omit<
      Complaint,
      'id' | 'complaint_number' | 'created_at' | 'updated_at' | 'updates' | 'status'
    > & { priority?: ComplaintPriority }
  ) => Complaint;
  updateStatus: (
    id: string,
    status: ComplaintStatus,
    message?: string,
    updatedBy?: string,
    updatedByRole?: string
  ) => void;
  assignDepartment: (
    id: string,
    department: string,
    officer?: string,
    note?: string,
    updatedBy?: string
  ) => void;
  resolveComplaint: (
    id: string,
    resolutionProofUrl: string,
    resolutionNotes: string,
    updatedBy?: string
  ) => void;
  addComplaintMessage: (
    id: string,
    message: string,
    senderName?: string,
    senderRole?: 'admin' | 'citizen',
    attachmentUrl?: string
  ) => Promise<void>;
  addCitizenFeedback: (id: string, rating: number, feedback: string) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  getComplaintByNumber: (number: string) => Complaint | undefined;
  deleteComplaint: (id: string) => void;
  resetToDefaultComplaints: () => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

const COMPLAINTS_STORAGE_KEY = 'civicconnect_complaints_v1';

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const stored = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => normalizeComplaint(item));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_COMPLAINTS.map((item) => normalizeComplaint(item));
  });

  const [dbStatus, setDbStatus] = useState<{
    status: string;
    database: string;
    mongoConfigured: boolean;
  }>({
    status: 'checking',
    database: 'Local Browser Storage Fallback',
    mongoConfigured: false,
  });

  // Query server health and pull database records
  useEffect(() => {
    let isMounted = true;
    civicApi.checkHealth().then((health) => {
      if (isMounted) setDbStatus(health);
    }).catch(() => {});

    civicApi.getComplaints().then((serverData) => {
      if (isMounted && Array.isArray(serverData) && serverData.length > 0) {
        const normalized = serverData.map((item: any) => normalizeComplaint(item));
        setComplaints(normalized);
      }
    }).catch(() => {
      // Offline or direct client mode: continues seamlessly with local data
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints));
    } catch {
      // ignore
    }
  }, [complaints]);

  // Compute live statistics
  const stats = useMemo<CivicStats>(() => {
    const total = complaints.length;
    const submitted = complaints.filter((c) => c.status === 'Submitted').length;
    const underReview = complaints.filter((c) => c.status === 'Under Review').length;
    const assigned = complaints.filter((c) => c.status === 'Assigned').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const rejected = complaints.filter((c) => c.status === 'Rejected').length;

    // Calculate average resolution duration in hours for resolved complaints
    const resolvedComplaints = complaints.filter(
      (c) => c.status === 'Resolved' && c.resolved_at
    );
    let avgResolutionHours = 38; // standard default
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((acc, c) => {
        const start = new Date(c.created_at).getTime();
        const end = new Date(c.resolved_at!).getTime();
        const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
        return acc + hours;
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    return {
      total,
      submitted,
      underReview,
      assigned,
      inProgress,
      resolved,
      rejected,
      avgResolutionHours,
    };
  }, [complaints]);

  // Generate unique complaint number: CC-2026-XXXXX
  const generateComplaintNumber = (): string => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `CC-2026-${randomSuffix}`;
  };

  const addComplaint = (
    data: Omit<
      Complaint,
      'id' | 'complaint_number' | 'created_at' | 'updated_at' | 'updates' | 'status'
    > & { priority?: ComplaintPriority }
  ): Complaint => {
    const newId = `cmp-${Date.now()}`;
    const complaintNumber = generateComplaintNumber();
    const now = new Date().toISOString();

    const initialUpdate: ComplaintUpdate = {
      id: `upd-${Date.now()}-1`,
      complaint_id: newId,
      status: 'Submitted',
      message: 'Complaint successfully filed by citizen via CivicConnect. Awaiting municipal triage.',
      updated_by: 'Citizen Portal',
      updated_by_role: 'system',
      created_at: now,
    };

    const newComplaint: Complaint = {
      ...data,
      id: newId,
      complaint_number: complaintNumber,
      status: 'Submitted',
      priority: data.priority || 'Medium',
      created_at: now,
      updated_at: now,
      updates: [initialUpdate],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Send to database asynchronously
    civicApi.createComplaint(newComplaint).catch((err) => {
      console.warn('Backend DB sync pending; cached in local storage:', err);
    });

    return newComplaint;
  };

  const matchesComplaintId = (c: Complaint, targetId: string) => {
    if (!targetId || !c) return false;
    const t = targetId.trim().toLowerCase();
    return (
      (c.id && c.id.toLowerCase() === t) ||
      ((c as any)._id && String((c as any)._id).toLowerCase() === t) ||
      (c.complaint_number && c.complaint_number.toLowerCase() === t)
    );
  };

  const updateStatus = (
    id: string,
    status: ComplaintStatus,
    message?: string,
    updatedBy: string = 'Civic Administrator',
    updatedByRole: string = 'admin'
  ) => {
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (!matchesComplaintId(c, id)) return c;

        const updateItem: ComplaintUpdate = {
          id: `upd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          complaint_id: c.id,
          status,
          message:
            message ||
            `Status updated to ${status} by ${updatedBy}.`,
          updated_by: updatedBy,
          updated_by_role: updatedByRole as any,
          created_at: now,
        };

        return {
          ...c,
          status,
          updated_at: now,
          resolved_at: status === 'Resolved' ? now : c.resolved_at,
          updates: [...(c.updates || []), updateItem],
        };
      })
    );

    // Sync to database
    civicApi
      .updateStatus(id, status, message, updatedBy)
      .then((serverDoc) => {
        if (serverDoc) {
          const norm = normalizeComplaint(serverDoc);
          setComplaints((prev) =>
            prev.map((c) => (matchesComplaintId(c, id) ? norm : c))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend status sync pending:', err);
      });
  };

  const assignDepartment = (
    id: string,
    department: string,
    officer?: string,
    note?: string,
    updatedBy: string = 'Civic Administrator'
  ) => {
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (!matchesComplaintId(c, id)) return c;

        const message = note
          ? `Assigned to ${department}${officer ? ` (Officer: ${officer})` : ''}. Note: ${note}`
          : `Assigned to ${department}${officer ? ` (Officer: ${officer})` : ''}.`;

        const updateItem: ComplaintUpdate = {
          id: `upd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          complaint_id: c.id,
          status: 'Assigned',
          message,
          updated_by: updatedBy,
          updated_by_role: 'admin',
          created_at: now,
        };

        return {
          ...c,
          status: 'Assigned',
          assigned_department: department,
          assigned_officer: officer || c.assigned_officer,
          updated_at: now,
          updates: [...(c.updates || []), updateItem],
        };
      })
    );

    // Sync to database
    civicApi
      .assignDepartment(id, department, officer, note, updatedBy)
      .then((serverDoc) => {
        if (serverDoc) {
          const norm = normalizeComplaint(serverDoc);
          setComplaints((prev) =>
            prev.map((c) => (matchesComplaintId(c, id) ? norm : c))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend assign sync pending:', err);
      });
  };

  const resolveComplaint = (
    id: string,
    resolutionProofUrl: string,
    resolutionNotes: string,
    updatedBy: string = 'Civic Field Inspector'
  ) => {
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (!matchesComplaintId(c, id)) return c;

        const updateItem: ComplaintUpdate = {
          id: `upd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          complaint_id: c.id,
          status: 'Resolved',
          message: resolutionNotes || 'Issue addressed on-site and verified by municipal crew.',
          updated_by: updatedBy,
          updated_by_role: 'staff',
          created_at: now,
          attachment_url: resolutionProofUrl,
        };

        return {
          ...c,
          status: 'Resolved',
          resolved_image_url: resolutionProofUrl,
          resolved_at: now,
          updated_at: now,
          updates: [...(c.updates || []), updateItem],
        };
      })
    );

    // Sync to database
    civicApi
      .resolveComplaint(id, resolutionProofUrl, resolutionNotes, updatedBy)
      .then((serverDoc) => {
        if (serverDoc) {
          const norm = normalizeComplaint(serverDoc);
          setComplaints((prev) =>
            prev.map((c) => (matchesComplaintId(c, id) ? norm : c))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend resolve sync pending:', err);
      });
  };

  const addComplaintMessage = async (
    id: string,
    message: string,
    senderName?: string,
    senderRole: 'admin' | 'citizen' = 'citizen',
    attachmentUrl?: string
  ) => {
    const now = new Date().toISOString();
    const newMsg: ComplaintUpdate = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      complaint_id: id,
      status: 'In Progress',
      message: message.trim(),
      updated_by: senderName || (senderRole === 'admin' ? 'Municipal Officer' : 'Resident Citizen'),
      updated_by_role: senderRole,
      created_at: now,
      attachment_url: attachmentUrl,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (!matchesComplaintId(c, id)) return c;
        newMsg.status = c.status;
        return {
          ...c,
          updated_at: now,
          updates: [...(c.updates || []), newMsg],
        };
      })
    );

    try {
      const serverDoc = await civicApi.addMessage(
        id,
        message,
        senderName,
        senderRole,
        attachmentUrl
      );
      if (serverDoc) {
        const norm = normalizeComplaint(serverDoc);
        setComplaints((prev) =>
          prev.map((c) => (matchesComplaintId(c, id) ? norm : c))
        );
      }
    } catch (err) {
      console.warn('Backend message sync failed:', err);
    }
  };

  const addCitizenFeedback = (id: string, rating: number, feedback: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          rating,
          feedback,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  const getComplaintById = (id: string): Complaint | undefined => {
    if (!id) return undefined;
    const clean = id.trim();
    return complaints.find(
      (c) => c.id === clean || (c as any)._id === clean || (c.complaint_number || '').toUpperCase() === clean.toUpperCase()
    );
  };

  const getComplaintByNumber = (complaintNumber: string): Complaint | undefined => {
    if (!complaintNumber) return undefined;
    const cleanNumber = complaintNumber.trim().toUpperCase();
    return complaints.find(
      (c) =>
        (c.complaint_number || '').toUpperCase() === cleanNumber ||
        c.id === complaintNumber ||
        (c as any)._id === complaintNumber
    );
  };

  const deleteComplaint = (id: string) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id && (c as any)._id !== id));
    civicApi.deleteComplaint(id).catch((err) => {
      console.warn('Backend delete sync failed:', err);
    });
  };

  const resetToDefaultComplaints = () => {
    setComplaints(INITIAL_COMPLAINTS);
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        stats,
        dbStatus,
        addComplaint,
        updateStatus,
        assignDepartment,
        resolveComplaint,
        addComplaintMessage,
        addCitizenFeedback,
        getComplaintById,
        getComplaintByNumber,
        deleteComplaint,
        resetToDefaultComplaints,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
