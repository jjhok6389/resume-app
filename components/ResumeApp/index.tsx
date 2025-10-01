import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  KeyboardTypeOptions,
} from 'react-native';

import styles from './ResumeApp.styles'; 

interface ResumeData {
  name: string;
  address: string;
  gender: string;
  birthYear: string;
  mobile: string;
  email: string;
  phone: string;
  schoolName: string;
  attendancePeriod: string;
  attendanceStatus: string;
  gpa: string;
  major: string;
  desiredJob: string;
  hasExperience: string;
  jobDescription: string;
  desiredLocation: string;
  desiredSalary: string;
  employmentType: string;
  workingHours: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Step {
  id: string;
  label: string;
  icon: string;
  requiredFields: string[];
}

interface Option {
  value: string;
  label: string;
}

export default function ResumeApp(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: '',
    address: '',
    gender: '',
    birthYear: '',
    mobile: '',
    email: '',
    phone: '',
    schoolName: '',
    attendancePeriod: '',
    attendanceStatus: '',
    gpa: '',
    major: '',
    desiredJob: '',
    hasExperience: '',
    jobDescription: '',
    desiredLocation: '',
    desiredSalary: '',
    employmentType: '',
    workingHours: '',
  });

  const steps: Step[] = [
    { 
      id: 'personal', 
      label: '개인정보', 
      icon: '👤',
      requiredFields: ['name', 'email', 'address', 'gender', 'birthYear', 'mobile']
    },
    { 
      id: 'education', 
      label: '학력', 
      icon: '🎓',
      requiredFields: ['schoolName', 'major', 'attendancePeriod', 'attendanceStatus']
    },
    { 
      id: 'career', 
      label: '희망직종', 
      icon: '💼',
      requiredFields: ['desiredJob', 'hasExperience']
    },
    { 
      id: 'conditions', 
      label: '근무조건', 
      icon: '📍',
      requiredFields: ['desiredLocation', 'desiredSalary']
    }
  ];

  // ... (validateField, handleInputChange 등 모든 함수 로직은 여기에 그대로 유지됩니다)
  const validateField = (field: string, value: string): string => {
    if (!value.trim() && steps[currentStep].requiredFields.includes(field)) {
      return '필수 입력 항목입니다';
    }
    
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return '올바른 이메일 형식이 아닙니다';
      }
    }
    
    if (field === 'mobile' && value) {
      const phoneRegex = /^010-?\d{3,4}-?\d{4}$/;
      if (!phoneRegex.test(value.replace(/-/g, ''))) {
        return '올바른 휴대폰 번호 형식이 아닙니다';
      }
    }
    
    if (field === 'birthYear' && value) {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        return '올바른 출생년도를 입력하세요';
      }
    }
    
    return '';
  };

  const handleInputChange = (field: keyof ResumeData, value: string): void => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleFieldBlur = (field: string): void => {
    setTouchedFields(prev => new Set(prev).add(field));
    const error = validateField(field, resumeData[field as keyof ResumeData]);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const getProgress = (): number => {
    const totalRequiredFields = steps.reduce((acc, step) => acc + step.requiredFields.length, 0);
    const filledRequiredFields = steps.reduce((acc, step) => {
      return acc + step.requiredFields.filter(field => 
        resumeData[field as keyof ResumeData].trim() !== ''
      ).length;
    }, 0);
    return (filledRequiredFields / totalRequiredFields) * 100;
  };

  const canProceedToNext = (): boolean => {
    const currentRequiredFields = steps[currentStep].requiredFields;
    return currentRequiredFields.every(field => 
      resumeData[field as keyof ResumeData].trim() !== ''
    );
  };

  const handleNext = (): void => {
    const currentRequiredFields = steps[currentStep].requiredFields;
    const errors: ValidationErrors = {};
    
    currentRequiredFields.forEach(field => {
      const error = validateField(field, resumeData[field as keyof ResumeData]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setValidationErrors(errors);
    setTouchedFields(new Set(currentRequiredFields));
    
    if (Object.keys(errors).length === 0 && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrev = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmit = (): void => {
    console.log('이력서 데이터:', resumeData);
    setShowSuccessModal(true);
  };

  const renderInput = (
    field: keyof ResumeData,
    label: string,
    placeholder: string,
    required: boolean = false,
    keyboardType: KeyboardTypeOptions = 'default',
    multiline: boolean = false
  ): React.JSX.Element => {
    const hasError = validationErrors[field] && touchedFields.has(field);
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            hasError && styles.inputError
          ]}
          value={resumeData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          onBlur={() => handleFieldBlur(field)}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 6 : 1}
        />
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{validationErrors[field]}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderRadioGroup = (field: keyof ResumeData, label: string, options: Option[]): React.JSX.Element => {
    const hasError = validationErrors[field] && touchedFields.has(field);
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.radioGroup}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => {
                handleInputChange(field, option.value);
                handleFieldBlur(field);
              }}
            >
              <View style={styles.radio}>
                {resumeData[field] === option.value && (
                  <View style={styles.radioSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{validationErrors[field]}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderPicker = (field: keyof ResumeData, label: string, options: Option[], required: boolean = false): React.JSX.Element => {
    const hasError = validationErrors[field] && touchedFields.has(field);
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[styles.picker, hasError && styles.inputError]}
          onPress={() => setShowPicker(field)}
        >
          <Text style={[styles.pickerText, !resumeData[field] && styles.placeholderText]}>
            {resumeData[field] ? options.find(opt => opt.value === resumeData[field])?.label : '선택하세요'}
          </Text>
          <Text style={styles.pickerIcon}>▼</Text>
        </TouchableOpacity>
        
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{validationErrors[field]}</Text>
          </View>
        )}

        <Modal
          visible={showPicker === field}
          transparent
          animationType="slide"
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            onPress={() => setShowPicker(null)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setShowPicker(null)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {options.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      handleInputChange(field, option.value);
                      handleFieldBlur(field);
                      setShowPicker(null);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                    {resumeData[field] === option.value && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  const renderStepContent = (): React.JSX.Element => {
    switch (currentStep) {
      case 0: // 개인정보
        return (
          <>
            {renderInput('name', '성명', '성명을 입력하세요', true)}
            {renderInput('email', '이메일', 'example@email.com', true, 'email-address')}
            {renderInput('address', '주소', '주소를 입력하세요', true)}
            {renderRadioGroup('gender', '성별', [
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' }
            ])}
            {renderInput('birthYear', '출생년도', '1990', true, 'numeric')}
            {renderInput('mobile', '휴대전화', '010-0000-0000', true, 'phone-pad')}
            {renderInput('phone', '일반전화', '02-0000-0000', false, 'phone-pad')}
          </>
        );

      case 1: // 학력사항
        return (
          <>
            {renderInput('schoolName', '학교명', '학교명을 입력하세요', true)}
            {renderInput('major', '전공명', '전공명을 입력하세요', true)}
            {renderInput('attendancePeriod', '재학기간', '2018.03 ~ 2022.02', true)}
            {renderPicker('attendanceStatus', '재학상태', [
              { value: 'graduated', label: '졸업' },
              { value: 'attending', label: '재학중' },
              { value: 'onLeave', label: '휴학중' },
              { value: 'dropped', label: '중퇴' }
            ], true)}
            {renderInput('gpa', '학점', '3.5/4.5', false)}
          </>
        );

      case 2: // 희망직종
        return (
          <>
            {renderInput('desiredJob', '희망직종', '예: 웹 개발자', true)}
            {renderInput('hasExperience', '경력여부', '예: 신입, 2년 경력', true)}
            {renderInput('jobDescription', '희망직무내용', '희망하는 직무 내용을 상세히 입력하세요', false, 'default', true)}
          </>
        );

      case 3: // 희망근무조건
        return (
          <>
            {renderInput('desiredLocation', '희망 근무 지역', '예: 서울특별시 강남구', true)}
            {renderInput('desiredSalary', '희망임금', '예: 연봉 3000만원', true)}
            {renderPicker('employmentType', '고용형태', [
              { value: 'fullTime', label: '정규직' },
              { value: 'contract', label: '계약직' },
              { value: 'partTime', label: '파트타임' },
              { value: 'internship', label: '인턴십' },
              { value: 'freelance', label: '프리랜서' }
            ])}
            {renderInput('workingHours', '희망근무시간', '예: 09:00 ~ 18:00', false)}
          </>
        );

      default:
        return <View />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handlePrev}
            disabled={currentStep === 0}
            style={styles.headerButton}
          >
            <Text style={[styles.headerIcon, currentStep === 0 && styles.headerIconDisabled]}>
              ←
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>이력서 작성</Text>
            <Text style={styles.headerSubtitle}>
              {currentStep + 1} / {steps.length} 단계
            </Text>
          </View>
          
          <View style={styles.headerButton} />
        </View>
        
        {/* 진행률 표시 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgress()}%` }
              ]} 
            />
          </View>
        </View>

        {/* 단계 인디케이터 */}
        <View style={styles.stepIndicator}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <View key={step.id} style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted
                ]}>
                  <Text style={[
                    styles.stepIcon,
                    (isActive || isCompleted) && styles.stepIconActive
                  ]}>
                    {isCompleted ? '✓' : step.icon}
                  </Text>
                </View>
                <Text style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive
                ]}>
                  {step.label}
                </Text>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted
                  ]} />
                )}
              </View>
            );
          })}
        </View>

        {/* 메인 콘텐츠 */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{steps[currentStep].icon}</Text>
              <Text style={styles.cardTitle}>{steps[currentStep].label}</Text>
            </View>
            
            <View style={styles.cardContent}>
              {renderStepContent()}
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutline]}
              onPress={handlePrev}
            >
              <Text style={styles.buttonOutlineText}>이전</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.buttonPrimary,
                !canProceedToNext() && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={!canProceedToNext()}
            >
              <Text style={styles.buttonPrimaryText}>다음</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.buttonPrimary,
                !canProceedToNext() && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!canProceedToNext()}
            >
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.buttonPrimaryText}>저장하기</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 성공 모달 */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <Text style={styles.successIconLarge}>✅</Text>
              <Text style={styles.successTitle}>이력서가 저장되었습니다!</Text>
              <Text style={styles.successMessage}>
                작성하신 이력서가 성공적으로 저장되었습니다.
                마이페이지에서 확인하실 수 있습니다.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => {
                    setShowSuccessModal(false);
                    // 마이페이지로 이동
                  }}
                >
                  <Text style={styles.buttonPrimaryText}>마이페이지로 이동</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.buttonOutline]}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text style={styles.buttonOutlineText}>계속 작성하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}