import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook for managing leads in Firestore
 */
const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all leads from Firestore
   */
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setLeads(leadsData);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new lead to the pipeline
   */
  const addLead = useCallback(async (leadData) => {
    try {
      // Check if lead already exists
      const leadsRef = collection(db, 'leads');
      const existingQuery = query(leadsRef, where('placeId', '==', leadData.placeId));
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        return { success: false, message: 'Lead already exists in pipeline' };
      }

      // Get first photo URL if available
      let photoUrl = '';
      if (leadData.photos && leadData.photos.length > 0) {
        try {
          photoUrl = leadData.photos[0].getUrl({ maxWidth: 400 });
        } catch (e) {
          photoUrl = '';
        }
      }

      const newLead = {
        placeId: leadData.placeId || leadData.id,
        businessName: leadData.displayName,
        category: leadData.category || (leadData.types ? leadData.types[0] : 'Business'),
        ratingCount: leadData.userRatingCount,
        rating: leadData.rating,
        leadScore: leadData.leadScore || 'Cold',
        phone: leadData.nationalPhoneNumber || leadData.internationalPhoneNumber || '',
        formattedWhatsapp: leadData.formattedWhatsapp || '',
        address: leadData.formattedAddress || '',
        email: '',
        webUrl: '',
        images: photoUrl ? [photoUrl] : [],
        status: 'New',
        notes: '',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(leadsRef, newLead);
      
      // Add to local state
      setLeads(prev => [{
        id: docRef.id,
        ...newLead,
        createdAt: new Date()
      }, ...prev]);

      return { success: true, message: 'Lead added to pipeline!' };
    } catch (err) {
      console.error('Error adding lead:', err);
      return { success: false, message: 'Failed to add lead. Check Firebase connection.' };
    }
  }, []);

  /**
   * Update lead status
   */
  const updateLeadStatus = useCallback(async (leadId, newStatus) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { status: newStatus });
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating status:', err);
      return { success: false, message: 'Failed to update status' };
    }
  }, []);

  /**
   * Update lead notes
   */
  const updateLeadNotes = useCallback(async (leadId, notes) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { notes });
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, notes } : lead
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating notes:', err);
      return { success: false, message: 'Failed to update notes' };
    }
  }, []);

  /**
   * Update lead email or web URL
   */
  const updateLeadContact = useCallback(async (leadId, field, value) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { [field]: value });
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, [field]: value } : lead
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating contact:', err);
      return { success: false, message: 'Failed to update contact info' };
    }
  }, []);

  /**
   * Delete a lead
   */
  const deleteLead = useCallback(async (leadId) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await deleteDoc(leadRef);
      
      setLeads(prev => prev.filter(lead => lead.id !== leadId));

      return { success: true, message: 'Lead removed from pipeline' };
    } catch (err) {
      console.error('Error deleting lead:', err);
      return { success: false, message: 'Failed to delete lead' };
    }
  }, []);

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    addLead,
    updateLeadStatus,
    updateLeadNotes,
    updateLeadContact,
    deleteLead,
    refreshLeads: fetchLeads
  };
};

export default useLeads;
