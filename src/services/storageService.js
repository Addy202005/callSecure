import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_CONTACTS } from '../data/mockContacts';
import { INITIAL_RECORDINGS, INITIAL_REPORTS } from '../data/mockInitialRecordings';

const CONTACTS_KEY = '@safeshield_contacts_v1';
const RECORDINGS_KEY = '@safeshield_recordings_v1';
const REPORTS_KEY = '@safeshield_reports_v1';
const SETTINGS_KEY = '@safeshield_settings_v1';
const VAULT_PIN_KEY = '@safeshield_vault_pin_v1';
const BLOCKED_NUMBERS_KEY = '@safeshield_blocked_numbers_v1';

const DEFAULT_VAULT_PIN = '1930';

let cachedContacts = [...INITIAL_CONTACTS];
let cachedRecordings = [...INITIAL_RECORDINGS];
let cachedBlockedNumbers = ['+91 98201 54321', '+91 80000 12345'];
let isInitialized = false;

export const StorageService = {
  async init() {
    if (isInitialized) return;
    try {
      const contactsStr = await AsyncStorage.getItem(CONTACTS_KEY);
      if (contactsStr) {
        cachedContacts = JSON.parse(contactsStr);
      } else {
        await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
      }

      const recsStr = await AsyncStorage.getItem(RECORDINGS_KEY);
      if (recsStr) {
        cachedRecordings = JSON.parse(recsStr);
      } else {
        await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(INITIAL_RECORDINGS));
      }

      const blockedStr = await AsyncStorage.getItem(BLOCKED_NUMBERS_KEY);
      if (blockedStr) {
        cachedBlockedNumbers = JSON.parse(blockedStr);
      }
    } catch (e) {
      console.warn('StorageService.init error:', e);
    } finally {
      isInitialized = true;
    }
  },

  getContacts() {
    return cachedContacts;
  },

  async saveContacts(contacts) {
    cachedContacts = contacts;
    try {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts', e);
    }
    return cachedContacts;
  },

  async addContact(contact) {
    const updated = [contact, ...cachedContacts];
    await this.saveContacts(updated);
    return updated;
  },

  async updateContact(contact) {
    const index = cachedContacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      cachedContacts[index] = contact;
      await this.saveContacts([...cachedContacts]);
    }
    return cachedContacts;
  },

  async deleteContact(id) {
    const updated = cachedContacts.filter(c => c.id !== id);
    await this.saveContacts(updated);
    return updated;
  },

  getRecordings() {
    return cachedRecordings;
  },

  async saveRecording(recording) {
    const existingIdx = cachedRecordings.findIndex(r => r.id === recording.id);
    if (existingIdx >= 0) {
      cachedRecordings[existingIdx] = recording;
    } else {
      cachedRecordings = [recording, ...cachedRecordings];
    }
    try {
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(cachedRecordings));
    } catch (e) {
      console.error('Failed to save recording', e);
    }
    return cachedRecordings;
  },

  async deleteRecording(id) {
    cachedRecordings = cachedRecordings.filter(r => r.id !== id);
    try {
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(cachedRecordings));
    } catch (e) {
      console.error('Failed to delete recording', e);
    }
    return cachedRecordings;
  },

  isNumberBlocked(phoneNumber) {
    if (!phoneNumber) return false;
    const clean = phoneNumber.replace(/\D/g, '');
    return cachedBlockedNumbers.some(n => n.replace(/\D/g, '') === clean);
  },

  async toggleBlockNumber(phoneNumber) {
    const clean = phoneNumber.replace(/\D/g, '');
    const exists = cachedBlockedNumbers.some(n => n.replace(/\D/g, '') === clean);
    if (exists) {
      cachedBlockedNumbers = cachedBlockedNumbers.filter(n => n.replace(/\D/g, '') !== clean);
    } else {
      cachedBlockedNumbers = [...cachedBlockedNumbers, phoneNumber];
    }
    try {
      await AsyncStorage.setItem(BLOCKED_NUMBERS_KEY, JSON.stringify(cachedBlockedNumbers));
    } catch (e) {
      console.error('Failed to toggle block number', e);
    }
    return cachedBlockedNumbers;
  },

  async getVaultPin() {
    try {
      const pin = await AsyncStorage.getItem(VAULT_PIN_KEY);
      return pin || DEFAULT_VAULT_PIN;
    } catch {
      return DEFAULT_VAULT_PIN;
    }
  },

  async setVaultPin(newPin) {
    try {
      await AsyncStorage.setItem(VAULT_PIN_KEY, newPin);
      return true;
    } catch {
      return false;
    }
  },

  async verifyVaultPin(enteredPin) {
    const pin = await this.getVaultPin();
    return enteredPin === pin;
  }
};
