import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';
import {
  Phone,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Trash2,
  Edit3,
  Star
} from 'lucide-react-native';

export function ContactCard({
  contact,
  onCall,
  onEdit,
  onDelete,
  onToggleBlock,
  isBlocked
}) {
  const [menuVisible, setMenuVisible] = useState(false);

  const isFraud = contact.riskRating === 'REPORTED_FRAUD' || contact.category === 'suspicious';
  const isSafe = contact.riskRating === 'SAFE' && !isBlocked;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.7}
        onPress={() => onCall(contact)}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {contact.avatarUrl ? (
            <Image source={{ uri: contact.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {(contact.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {contact.isFavorite && (
            <View style={styles.favoriteBadge}>
              <Star size={9} color="#fbbf24" fill="#fbbf24" />
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.infoWrapper}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {contact.name}
            </Text>
            {isBlocked && (
              <View style={styles.blockedBadge}>
                <Text style={styles.blockedText}>BLOCKED</Text>
              </View>
            )}
          </View>

          <Text style={styles.phoneText} numberOfLines={1}>
            {contact.phone}
          </Text>

          {contact.company ? (
            <Text style={styles.companyText} numberOfLines={1}>
              {contact.company}
            </Text>
          ) : null}
        </View>

        {/* Right Side: 3-Dot at Top & Verified + Call at Right-Most */}
        <View style={styles.actionColumn}>
          {/* 3-Dot Options Button */}
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setMenuVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={16} color="#94a3b8" />
          </TouchableOpacity>

          {/* Bottom Row: Risk Badge & Call Button */}
          <View style={styles.bottomActions}>
            {isFraud ? (
              <View style={styles.riskBadgeFraud}>
                <ShieldAlert size={11} color="#f43f5e" />
                <Text style={styles.riskTextFraud}>Fraud</Text>
              </View>
            ) : isSafe ? (
              <View style={styles.riskBadgeSafe}>
                <ShieldCheck size={11} color="#10b981" />
                <Text style={styles.riskTextSafe}>Verified</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => onCall(contact)}
              activeOpacity={0.8}
            >
              <Phone size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Context Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>{contact.name}</Text>
            <Text style={styles.menuSubtitle}>{contact.phone}</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                if (onEdit) onEdit(contact);
              }}
            >
              <Edit3 size={16} color="#818cf8" />
              <Text style={styles.menuItemText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                if (onToggleBlock) onToggleBlock(contact);
              }}
            >
              {isBlocked ? (
                <>
                  <ShieldCheck size={16} color="#34d399" />
                  <Text style={[styles.menuItemText, { color: '#34d399' }]}>Unblock Contact</Text>
                </>
              ) : (
                <>
                  <Ban size={16} color="#fb7185" />
                  <Text style={[styles.menuItemText, { color: '#fb7185' }]}>Block Number</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onCall(contact);
              }}
            >
              <Phone size={16} color="#34d399" />
              <Text style={styles.menuItemText}>Call with SafeShield</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.deleteItem]}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  'Delete Contact',
                  `Are you sure you want to remove ${contact.name}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => onDelete(contact.id) }
                  ]
                );
              }}
            >
              <Trash2 size={16} color="#f43f5e" />
              <Text style={[styles.menuItemText, { color: '#f43f5e' }]}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155'
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  avatarInitials: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: 'bold'
  },
  favoriteBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#f59e0b'
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  nameText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1
  },
  blockedBadge: {
    backgroundColor: '#881337',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f43f5e'
  },
  blockedText: {
    color: '#fecdd3',
    fontSize: 9,
    fontWeight: '700'
  },
  phoneText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'monospace'
  },
  companyText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8
  },
  moreButton: {
    padding: 4,
    marginBottom: 8
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  riskBadgeSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  riskTextSafe: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '600'
  },
  riskBadgeFraud: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)'
  },
  riskTextFraud: {
    color: '#fb7185',
    fontSize: 10,
    fontWeight: '600'
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  menuContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  menuSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  menuItemText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500'
  },
  menuDivider: {
    height: 6
  },
  deleteItem: {
    borderBottomWidth: 0
  }
});
