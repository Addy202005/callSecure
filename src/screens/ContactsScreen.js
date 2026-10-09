import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  UserPlus,
  Star,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Phone,
  X
} from 'lucide-react-native';
import { ContactCard } from '../components/ContactCard';
import { StorageService } from '../services/storageService';

export function ContactsScreen({ onStartCall }) {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, favorites, blocked, suspicious, emergency
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Contact (Email removed as per requirements)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('personal');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const list = StorageService.getContacts();
    setContacts([...list]);
  };

  const handleToggleBlock = async (contact) => {
    await StorageService.toggleBlockNumber(contact.phone);
    loadContacts();
  };

  const handleDeleteContact = async (id) => {
    const updated = await StorageService.deleteContact(id);
    setContacts([...updated]);
  };

  const handleSaveNewContact = async () => {
    if (!name.trim() || !phone.trim()) return;

    const newContact = {
      id: 'cnt-' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      company: company.trim() || undefined,
      category: category,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      isFavorite: false,
      callCount: 1,
      notes: notes.trim() || 'Added via SafeShield Mobile',
      riskRating: 'SAFE',
      reputationScore: 98,
      reportCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = await StorageService.addContact(newContact);
    setContacts([...updated]);
    setIsAddModalOpen(false);

    // Reset fields
    setName('');
    setPhone('');
    setCompany('');
    setNotes('');
  };

  // Filter and Sort contacts
  // In favorites and blocked, order by most frequently used (callCount descending)
  const filteredContacts = useMemo(() => {
    let result = contacts.filter((c) => {
      const isBlocked = StorageService.isNumberBlocked(c.phone) || c.isBlocked;
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'favorites') {
        return c.isFavorite;
      }
      if (selectedCategory === 'blocked') {
        return isBlocked;
      }
      if (selectedCategory === 'suspicious') {
        return c.category === 'suspicious' || c.riskRating === 'REPORTED_FRAUD';
      }
      if (selectedCategory === 'emergency') {
        return c.category === 'emergency';
      }
      return true;
    });

    // Sort by most frequently used (callCount) for favorites and blocked tabs
    if (selectedCategory === 'favorites' || selectedCategory === 'blocked') {
      result.sort((a, b) => (b.callCount || 0) - (a.callCount || 0));
    } else {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [contacts, searchQuery, selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{contacts.length}</Text>
          </View>
        </View>

        {/* Inline Search Bar with slightly reduced width */}
        <View style={styles.searchBarWrapper}>
          <Search size={14} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts, numbers..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalOpen(true)}
          activeOpacity={0.8}
        >
          <UserPlus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filter Category Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedCategory === 'all' && styles.chipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive]}>
              All ({contacts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, selectedCategory === 'favorites' && styles.chipActive]}
            onPress={() => setSelectedCategory('favorites')}
          >
            <Star size={12} color={selectedCategory === 'favorites' ? '#fbbf24' : '#94a3b8'} fill={selectedCategory === 'favorites' ? '#fbbf24' : 'transparent'} />
            <Text style={[styles.chipText, selectedCategory === 'favorites' && styles.chipTextActive]}>
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, selectedCategory === 'blocked' && styles.chipActive]}
            onPress={() => setSelectedCategory('blocked')}
          >
            <Ban size={12} color={selectedCategory === 'blocked' ? '#fb7185' : '#94a3b8'} />
            <Text style={[styles.chipText, selectedCategory === 'blocked' && styles.chipTextActive]}>
              Blocked
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, selectedCategory === 'suspicious' && styles.chipActive]}
            onPress={() => setSelectedCategory('suspicious')}
          >
            <ShieldAlert size={12} color={selectedCategory === 'suspicious' ? '#f43f5e' : '#94a3b8'} />
            <Text style={[styles.chipText, selectedCategory === 'suspicious' && styles.chipTextActive]}>
              Suspicious
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, selectedCategory === 'emergency' && styles.chipActive]}
            onPress={() => setSelectedCategory('emergency')}
          >
            <ShieldCheck size={12} color={selectedCategory === 'emergency' ? '#34d399' : '#94a3b8'} />
            <Text style={[styles.chipText, selectedCategory === 'emergency' && styles.chipTextActive]}>
              Emergency
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            isBlocked={StorageService.isNumberBlocked(item.phone) || item.isBlocked}
            onCall={onStartCall}
            onToggleBlock={handleToggleBlock}
            onDelete={handleDeleteContact}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>Try changing your filter or add a new contact</Text>
          </View>
        }
      />

      {/* Add Contact Modal */}
      <Modal visible={isAddModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Contact</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Inspector Ramesh or Anita"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>Organization / Company</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Cyber Cell or Family"
                placeholderTextColor="#64748b"
                value={company}
                onChangeText={setCompany}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryRadioRow}>
                {['personal', 'work', 'emergency', 'suspicious'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryRadio, category === cat && styles.categoryRadioActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryRadioText, category === cat && styles.categoryRadioTextActive]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Security Notes</Text>
              <TextInput
                style={[styles.modalInput, styles.notesInput]}
                placeholder="Add verification notes or scam warning history..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsAddModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, (!name.trim() || !phone.trim()) && styles.saveButtonDisabled]}
                disabled={!name.trim() || !phone.trim()}
                onPress={handleSaveNewContact}
              >
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  counterBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  counterText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700'
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 10,
    height: 38
  },
  searchIcon: {
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 4
  },
  clearSearchBtn: {
    padding: 4
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  chipsContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a'
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 5
  },
  chipActive: {
    backgroundColor: '#1e1b4b',
    borderColor: '#6366f1'
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#c7d2fe',
    fontWeight: '700'
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 30
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600'
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  modalForm: {
    marginBottom: 16
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10
  },
  modalInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top'
  },
  categoryRadioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4
  },
  categoryRadio: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryRadioActive: {
    backgroundColor: '#4338ca',
    borderColor: '#6366f1'
  },
  categoryRadioText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  categoryRadioTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600'
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center'
  },
  saveButtonDisabled: {
    opacity: 0.5
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
