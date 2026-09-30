import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { X, Upload, CheckCircle2, Scissors, Sparkles, MapPin, Calendar, DollarSign, Package } from 'lucide-react-native';
import { useMarketplace, GARMENT_CATEGORIES } from '../hooks/use-marketplace';

interface PostWorkModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PostWorkModal({ visible, onClose, onSuccess }: PostWorkModalProps) {
  const { postJob } = useMarketplace();

  const [selectedCategoryId, setSelectedCategoryId] = useState(GARMENT_CATEGORIES[0].id);
  const selectedCatObj = GARMENT_CATEGORIES.find(c => c.id === selectedCategoryId) || GARMENT_CATEGORIES[0];

  const [selectedSubcategory, setSelectedSubcategory] = useState(selectedCatObj.subcategories[0]);
  const [quantity, setQuantity] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('15');
  const [location, setLocation] = useState('PN Road, Tiruppur');
  const [description, setDescription] = useState('');
  const [contactPref, setContactPref] = useState<'call' | 'whatsapp' | 'both'>('both');
  const [sampleImage, setSampleImage] = useState<string | null>('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = GARMENT_CATEGORIES.find(c => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0]);
    }
  };

  const handleSubmit = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Required Field', 'Please enter a valid quantity in pieces.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Required Field', 'Please enter your work location in Tiruppur.');
      return;
    }

    try {
      setIsSubmitting(true);
      await postJob({
        category: selectedCatObj.name,
        subcategory: selectedSubcategory,
        quantity: parseInt(quantity, 10),
        ratePerPiece: ratePerPiece ? parseFloat(ratePerPiece) : undefined,
        deadlineDays: deadlineDays ? parseInt(deadlineDays, 10) : 15,
        location: location.trim(),
        description: description.trim() || `${selectedCatObj.name} (${selectedSubcategory}) for ${parseInt(quantity, 10).toLocaleString()} pcs.`,
        images: sampleImage ? [sampleImage] : [],
        contactPreference: contactPref,
      });

      setIsSubmitting(false);
      onSuccess();
    } catch (e) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', 'Failed to post job work requirement. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTag}>NEW JOB-WORK REQUIREMENT</Text>
            <Text style={styles.headerTitle}>Post Work</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Section 1: Work Category */}
          <View style={styles.section}>
            <Text style={styles.label}>1. Select Work Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {GARMENT_CATEGORIES.map(cat => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => handleCategorySelect(cat.id)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Section 2: Sub-category */}
          <View style={styles.section}>
            <Text style={styles.label}>2. Process Sub-category *</Text>
            <View style={styles.subCatGrid}>
              {selectedCatObj.subcategories.map(sub => {
                const isSelected = sub === selectedSubcategory;
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subChip, isSelected && styles.subChipActive]}
                    onPress={() => setSelectedSubcategory(sub)}
                  >
                    <Text style={[styles.subChipText, isSelected && styles.subChipTextActive]}>
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 3: Quantity & Rate */}
          <View style={styles.rowSection}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Total Pieces (pcs) *</Text>
              <View style={styles.inputWrapper}>
                <Package size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 5000"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Rate per Piece (₹/pc)</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 85 (optional)"
                  keyboardType="numeric"
                  value={ratePerPiece}
                  onChangeText={setRatePerPiece}
                />
              </View>
            </View>
          </View>

          {/* Section 4: Deadline & Location */}
          <View style={styles.rowSection}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Target Days (Deadline)</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="15 days"
                  keyboardType="numeric"
                  value={deadlineDays}
                  onChangeText={setDeadlineDays}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1.2 }]}>
              <Text style={styles.label}>Work Location *</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="PN Road, Tiruppur"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
          </View>

          {/* Section 5: Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Work Details / Specifications</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Provide fabric details, machine requirements, GSM, or quality checks..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Section 6: Sample Photo */}
          <View style={styles.section}>
            <Text style={styles.label}>Sample Photo / Reference Garment</Text>
            {sampleImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: sampleImage }} style={styles.samplePreview} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSampleImage(null)}>
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => setSampleImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500')}
              >
                <Upload size={24} color="#64748B" />
                <Text style={styles.uploadText}>Upload Sample Image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section 7: Contact Preference */}
          <View style={styles.section}>
            <Text style={styles.label}>How should job units contact you?</Text>
            <View style={styles.prefRow}>
              <TouchableOpacity
                style={[styles.prefBtn, contactPref === 'both' && styles.prefBtnActive]}
                onPress={() => setContactPref('both')}
              >
                <Text style={[styles.prefText, contactPref === 'both' && styles.prefTextActive]}>Both Call & WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.prefBtn, contactPref === 'call' && styles.prefBtnActive]}
                onPress={() => setContactPref('call')}
              >
                <Text style={[styles.prefText, contactPref === 'call' && styles.prefTextActive]}>Call Only</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.prefBtn, contactPref === 'whatsapp' && styles.prefBtnActive]}
                onPress={() => setContactPref('whatsapp')}
              >
                <Text style={[styles.prefText, contactPref === 'whatsapp' && styles.prefTextActive]}>WhatsApp Only</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Posting Work...' : 'POST WORK REQUIREMENT'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  subChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  subChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    height: 90,
  },
  uploadBox: {
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  previewContainer: {
    position: 'relative',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  samplePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  prefBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  prefText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  prefTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
