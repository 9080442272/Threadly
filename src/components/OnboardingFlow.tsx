import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Factory,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Building2,
  Phone,
  Sparkles,
  Scissors,
  Flame,
  Printer,
  Package,
  ShieldCheck,
} from 'lucide-react-native';
import { useMarketplace } from '../hooks/use-marketplace';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { loginUser, updateProfile, selectAction, completeOnboarding } = useMarketplace();

  const [step, setStep] = useState<number>(1); // Steps 1 to 8

  // Step 5: Mobile & OTP Form State
  const [mobile, setMobile] = useState('9842212345');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Step 6: Profile Setup State
  const [personName, setPersonName] = useState('Karthik Raja');
  const [companyName, setCompanyName] = useState('Vardhman Knits & Garments');
  const [gstNumber, setGstNumber] = useState('33AAAAA0000A1Z5');
  const [description, setDescription] = useState('Specialized in circular knits & T-shirt job work.');

  // Step 7: Location State
  const [selectedArea, setSelectedArea] = useState('PN Road, Tiruppur');

  const TIRUPPUR_AREAS = [
    'PN Road, Tiruppur',
    'Khaderpet, Tiruppur',
    'Dharapuram Road, Tiruppur',
    'College Road, Tiruppur',
    'Mangalam Road, Tiruppur',
    'Palladam Road, Tiruppur',
    'Avinashi Road, Tiruppur',
  ];

  const handleNext = () => {
    if (step < 8) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Step 5: OTP Submit
  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setOtpCode('1234');
  };

  const handleVerifyOtp = () => {
    if (otpCode !== '1234') {
      Alert.alert('OTP Error', 'Invalid OTP. Please enter 1234.');
      return;
    }
    setStep(6); // Move to Profile setup
  };

  // Step 6: Profile Submit
  const handleProfileSubmit = async () => {
    if (!personName.trim() || !companyName.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and garment company name.');
      return;
    }
    setStep(7); // Move to Location setup
  };

  // Step 7: Location Submit
  const handleLocationSubmit = async () => {
    await loginUser(mobile, personName, companyName, selectedArea);
    await updateProfile({ gstNumber, companyDescription: description });
    setStep(8); // Onboarding complete
  };

  // Step 8: Final Action Choice
  const handleFinishOnboarding = async (chosenAction: 'POST_WORK' | 'FIND_WORK') => {
    selectAction(chosenAction);
    await completeOnboarding();
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & Progress Dots */}
      <View style={styles.topNav}>
        {step > 1 && step < 8 ? (
          <TouchableOpacity style={styles.navBtn} onPress={handleBack}>
            <ArrowLeft size={20} color="#64748B" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        {/* Progress Bar (Steps 1 to 8) */}
        <View style={styles.progressDots}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <View
              key={s}
              style={[
                styles.dot,
                s === step && styles.dotActive,
                s < step && styles.dotCompleted,
              ]}
            />
          ))}
        </View>

        {step < 5 ? (
          <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(5)}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ==================================================== */}
        {/* STEP 1 — SPLASH SCREEN */}
        {/* ==================================================== */}
        {step === 1 && (
          <View style={styles.centerStep}>
            <View style={styles.logoBadge}>
              <Scissors size={40} color="#2563EB" />
            </View>

            <Text style={styles.brandName}>THREADLY</Text>
            <Text style={styles.tagline}>"Garment Job Work. Connected."</Text>

            <View style={styles.garmentBadgeRow}>
              <View style={styles.miniTag}><Text style={styles.miniTagText}>STITCHING</Text></View>
              <View style={styles.miniTag}><Text style={styles.miniTagText}>IRONING</Text></View>
              <View style={styles.miniTag}><Text style={styles.miniTagText}>BUTTON / KAAJA</Text></View>
              <View style={styles.miniTag}><Text style={styles.miniTagText}>PRINTING</Text></View>
            </View>

            <Text style={styles.splashDesc}>
              Tiruppur's direct B2B network for garment manufacturers & job-work units.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>GET STARTED</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 2 — INTRO 1: THE PROBLEM */}
        {/* ==================================================== */}
        {step === 2 && (
          <View style={styles.stepBlock}>
            <View style={styles.introHeaderTag}>
              <Text style={styles.introTagText}>THE CHALLENGE</Text>
            </View>

            <Text style={styles.headlineTamil}>Work irukku. Right unit kidaikkuma?</Text>

            <Text style={styles.bodyTamil}>
              Stitching, ironing, button, kaaja, finishing madhiri job work-ku correct unit-a quickly find panna help pannrom.
            </Text>

            {/* Visual Garment Cards */}
            <View style={styles.catGrid}>
              <View style={styles.catBox}>
                <Scissors size={24} color="#2563EB" />
                <Text style={styles.catBoxLabel}>Stitching</Text>
              </View>
              <View style={styles.catBox}>
                <Flame size={24} color="#D97706" />
                <Text style={styles.catBoxLabel}>Ironing</Text>
              </View>
              <View style={styles.catBox}>
                <Sparkles size={24} color="#16A34A" />
                <Text style={styles.catBoxLabel}>Button / Kaaja</Text>
              </View>
              <View style={styles.catBox}>
                <Printer size={24} color="#9333EA" />
                <Text style={styles.catBoxLabel}>Printing</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>NEXT</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 3 — INTRO 2: THE SOLUTION */}
        {/* ==================================================== */}
        {step === 3 && (
          <View style={styles.stepBlock}>
            <View style={styles.introHeaderTag}>
              <Text style={styles.introTagText}>THE SOLUTION</Text>
            </View>

            <Text style={styles.headlineTamil}>Work Post Pannu. Work Find Pannu.</Text>

            <Text style={styles.bodyTamil}>
              Unga requirement-a post pannunga. Available units adha paathu direct-ah contact pannalaam.
            </Text>

            {/* Diagram: Company A -> Job Post -> Job Work Unit */}
            <View style={styles.diagramCard}>
              <View style={styles.diagramItem}>
                <Building2 size={24} color="#2563EB" />
                <Text style={styles.diagramText}>Company A</Text>
                <Text style={styles.diagramSub}>Posts Requirement</Text>
              </View>

              <ArrowRight size={20} color="#94A3B8" />

              <View style={styles.diagramItem}>
                <Factory size={24} color="#16A34A" />
                <Text style={styles.diagramText}>Job Work Unit</Text>
                <Text style={styles.diagramSub}>Executes Work</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>CONTINUE</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 4 — INTRO 3: TWO-WAY MARKETPLACE */}
        {/* ==================================================== */}
        {step === 4 && (
          <View style={styles.stepBlock}>
            <View style={styles.introHeaderTag}>
              <Text style={styles.introTagText}>TWO-WAY MARKETPLACE</Text>
            </View>

            <Text style={styles.headlineTamil}>Neenga rendu side-um use pannalaam.</Text>

            <View style={styles.actionDualContainer}>
              {/* Option A */}
              <View style={styles.actionDualBox}>
                <Factory size={26} color="#2563EB" />
                <Text style={styles.actionDualTitle}>POST WORK</Text>
                <Text style={styles.actionDualSub}>"I have work that needs to be done"</Text>
              </View>

              {/* Option B */}
              <View style={styles.actionDualBox}>
                <Search size={26} color="#16A34A" />
                <Text style={styles.actionDualTitle}>FIND WORK</Text>
                <Text style={styles.actionDualSub}>"I have capacity and want to take work"</Text>
              </View>
            </View>

            <View style={styles.noRoleNotice}>
              <ShieldCheck size={16} color="#2563EB" />
              <Text style={styles.noRoleNoticeText}>
                No permanent roles. The same user can post work and find/take work anytime.
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>PROCEED TO LOGIN</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 5 — LOGIN / OTP SCREEN */}
        {/* ==================================================== */}
        {step === 5 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Mobile Authentication</Text>
            <Text style={styles.stepSub}>Enter your mobile number to get started with Threadly.</Text>

            {!otpSent ? (
              <View style={styles.inputCard}>
                <Text style={styles.fieldLabel}>Mobile Number (+91)</Text>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98422 12345"
                    keyboardType="numeric"
                    maxLength={10}
                    value={mobile}
                    onChangeText={setMobile}
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleSendOtp}>
                  <Text style={styles.primaryBtnText}>SEND OTP</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputCard}>
                <Text style={styles.fieldLabel}>Enter 4-Digit OTP sent to +91 {mobile}</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="1234"
                  keyboardType="numeric"
                  maxLength={4}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
                <Text style={styles.demoTip}>Demo OTP: Enter 1234</Text>

                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleVerifyOtp}>
                  <Text style={styles.primaryBtnText}>VERIFY & CONTINUE</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 6 — BUSINESS PROFILE SETUP */}
        {/* ==================================================== */}
        {step === 6 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Business Profile Setup</Text>
            <Text style={styles.stepSub}>Enter basic details about your garment company or unit.</Text>

            <View style={styles.inputCard}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Your Name *</Text>
                <TextInput style={styles.textInput} value={personName} onChangeText={setPersonName} placeholder="e.g. Karthik Raja" />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Garment Company / Unit Name *</Text>
                <TextInput style={styles.textInput} value={companyName} onChangeText={setCompanyName} placeholder="e.g. Vardhman Knits" />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>GSTIN (Optional)</Text>
                <TextInput style={styles.textInput} value={gstNumber} onChangeText={setGstNumber} placeholder="33AAAAA0000A1Z5" />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Business Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 70 }]}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. Specialized in circular knits, T-shirts, and flatlock stitching."
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleProfileSubmit}>
                <Text style={styles.primaryBtnText}>SAVE & NEXT</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 7 — LOCATION SETUP */}
        {/* ==================================================== */}
        {step === 7 && (
          <View style={styles.stepBlock}>
            <Text style={styles.stepTitle}>Where is your unit located?</Text>
            <Text style={styles.stepSub}>Select your primary Tiruppur garment hub area.</Text>

            <View style={styles.locationGrid}>
              {TIRUPPUR_AREAS.map(area => {
                const isSelected = selectedArea === area;
                return (
                  <TouchableOpacity
                    key={area}
                    style={[styles.areaChip, isSelected && styles.areaChipActive]}
                    onPress={() => setSelectedArea(area)}
                  >
                    <MapPin size={16} color={isSelected ? '#2563EB' : '#64748B'} />
                    <Text style={[styles.areaChipText, isSelected && styles.areaChipTextActive]}>{area}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleLocationSubmit}>
              <Text style={styles.primaryBtnText}>SET LOCATION & COMPLETE</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* STEP 8 — ONBOARDING COMPLETE */}
        {/* ==================================================== */}
        {step === 8 && (
          <View style={styles.centerStep}>
            <View style={styles.successIconBadge}>
              <CheckCircle2 size={54} color="#16A34A" />
            </View>

            <Text style={styles.brandName}>Ready to get started.</Text>
            <Text style={styles.splashDesc}>
              Your unit profile ({companyName}, {selectedArea}) is ready! Choose what you want to do right now.
            </Text>

            <View style={styles.finalActionStack}>
              <TouchableOpacity
                style={styles.actionPostBtn}
                activeOpacity={0.88}
                onPress={() => handleFinishOnboarding('POST_WORK')}
              >
                <Factory size={22} color="#FFFFFF" />
                <Text style={styles.actionPostText}>+ POST WORK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionFindBtn}
                activeOpacity={0.88}
                onPress={() => handleFinishOnboarding('FIND_WORK')}
              >
                <Search size={22} color="#FFFFFF" />
                <Text style={styles.actionFindText}>🔍 FIND WORK</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.finalNote}>You can use both options anytime from your dashboard.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2563EB',
  },
  dotCompleted: {
    backgroundColor: '#93C5FD',
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerStep: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 20,
  },
  garmentBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 20,
  },
  miniTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  splashDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepBlock: {
    paddingTop: 10,
  },
  introHeaderTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  introTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  headlineTamil: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 30,
    marginBottom: 10,
  },
  bodyTamil: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  catBox: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  catBoxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  diagramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30,
  },
  diagramItem: {
    alignItems: 'center',
    gap: 4,
  },
  diagramText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  diagramSub: {
    fontSize: 10,
    color: '#64748B',
  },
  actionDualContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionDualBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  actionDualTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionDualSub: {
    fontSize: 12,
    color: '#64748B',
  },
  noRoleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 30,
  },
  noRoleNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#0F172A',
  },
  demoTip: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  locationGrid: {
    gap: 10,
    marginBottom: 30,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  areaChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  areaChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  areaChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  successIconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  finalActionStack: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  actionPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionPostText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  actionFindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionFindText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  finalNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
