// app/job-posting.tsx
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import styles from '../components/ResumeApp/ResumeApp.styles';

// 채용공고 데이터 인터페이스
interface JobPostingData {
  companyName: string;
  jobTitle: string;
  workLocation: string;
  recruitmentPeriod: string;
  qualifications: string;
  idealCandidate: string;
  preferredQualifications: string;
  jobDescription: string;
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

export default function JobPostingScreen(): React.JSX.Element {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [jobPostingData, setJobPostingData] = useState<JobPostingData>({
    companyName: '',
    jobTitle: '',
    workLocation: '',
    recruitmentPeriod: '',
    qualifications: '',
    idealCandidate: '',
    preferredQualifications: '',
    jobDescription: '',
  });

  // 단계별 설정
  const steps: Step[] = [
    {
      id: 'basic',
      label: '기본 정보',
      icon: '🏢',
      requiredFields: ['companyName', 'jobTitle', 'workLocation', 'recruitmentPeriod'],
    },
    {
      id: 'requirements',
      label: '지원 요건',
      icon: '👤',
      requiredFields: ['qualifications', 'idealCandidate', 'preferredQualifications'],
    },
    {
      id: 'details',
      label: '업무 내용',
      icon: '📋',
      requiredFields: ['jobDescription'],
    },
  ];

  // 유효성 검사
  const validateField = (field: string, value: string): string => {
    if (!value.trim() && steps[currentStep].requiredFields.includes(field)) {
      return '필수 입력 항목입니다';
    }
    return '';
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof JobPostingData, value: string): void => {
    setJobPostingData(prev => ({ ...prev, [field]: value }));
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // 포커스 아웃 핸들러
  const handleFieldBlur = (field: string): void => {
    setTouchedFields(prev => new Set(prev).add(field));
    const error = validateField(field, jobPostingData[field as keyof JobPostingData]);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  // 전체 진행률 계산
  const getProgress = (): number => {
    const totalFields = steps.reduce((acc, step) => acc + step.requiredFields.length, 0);
    const filledFields = steps.reduce((acc, step) => 
      acc + step.requiredFields.filter(field => 
        jobPostingData[field as keyof JobPostingData].trim() !== ''
      ).length, 0
    );
    return (filledFields / totalFields) * 100;
  };

  // 다음 단계로 진행 가능 여부
  const canProceedToNext = (): boolean => {
    const currentRequiredFields = steps[currentStep].requiredFields;
    return currentRequiredFields.every(field => 
      jobPostingData[field as keyof JobPostingData].trim() !== ''
    );
  };

  // 다음 버튼 핸들러
  const handleNext = (): void => {
    const currentRequiredFields = steps[currentStep].requiredFields;
    const errors: ValidationErrors = {};
    
    currentRequiredFields.forEach(field => {
      const error = validateField(field, jobPostingData[field as keyof JobPostingData]);
      if (error) errors[field] = error;
    });

    setValidationErrors(errors);
    setTouchedFields(new Set(currentRequiredFields));

    if (Object.keys(errors).length === 0 && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // 이전 버튼 핸들러
  const handlePrev = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // 저장 핸들러
  const handleSave = (): void => {
    const currentRequiredFields = steps[currentStep].requiredFields;
    const errors: ValidationErrors = {};
    
    currentRequiredFields.forEach(field => {
      const error = validateField(field, jobPostingData[field as keyof JobPostingData]);
      if (error) errors[field] = error;
    });

    setValidationErrors(errors);
    setTouchedFields(new Set(currentRequiredFields));

    if (Object.keys(errors).length === 0) {
      console.log('채용공고 저장:', jobPostingData);
      // 여기에 저장 로직 추가 (AsyncStorage, API 호출 등)
      router.back();
    }
  };

  // 입력 필드 렌더링
  const renderInput = (
    field: keyof JobPostingData,
    label: string,
    placeholder: string,
    required = false,
    multiline = false
  ) => {
    const hasError = validationErrors[field] && touchedFields.has(field);

    return (
      <View style={styles.inputContainer} key={field}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, multiline && styles.textArea, hasError && styles.inputError]}
          value={jobPostingData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          onBlur={() => handleFieldBlur(field)}
          placeholder={placeholder}
          placeholderTextColor="#999"
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

  // 단계별 콘텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 기본 정보
        return (
          <>
            {renderInput('companyName', '회사명', '회사명을 입력하세요', true)}
            {renderInput('jobTitle', '공고명', '채용공고 제목을 입력하세요', true)}
            {renderInput('workLocation', '근무지역', '예: 서울특별시 강남구', true)}
            {renderInput('recruitmentPeriod', '모집기간', '예: 2025.10.01 ~ 2025.10.31', true)}
          </>
        );
      case 1: // 지원 요건
        return (
          <>
            {renderInput('qualifications', '자격요건', '필수 자격요건을 입력하세요', true, true)}
            {renderInput('idealCandidate', '인재상', '원하는 인재상을 입력하세요', true, true)}
            {renderInput('preferredQualifications', '우대사항', '우대사항을 입력하세요', true, true)}
          </>
        );
      case 2: // 업무 내용
        return (
          <>
            {renderInput('jobDescription', '업무내용', '담당할 업무 내용을 상세히 입력하세요', true, true)}
          </>
        );
      default:
        return null;
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
            <Text style={styles.headerTitle}>💼 채용공고 작성</Text>
            <Text style={styles.headerSubtitle}>
              {currentStep + 1} / {steps.length}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 진행률 표시 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.round(getProgress())}%` }]} />
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
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {step.label}
                </Text>
                {index < steps.length - 1 && (
                  <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                )}
              </View>
            );
          })}
        </View>

        {/* 입력 폼 */}
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
          {/* '이전' 버튼: 첫 단계(currentStep === 0)가 아닐 때만 보입니다. */}
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={handlePrev}
            >
              <Text style={styles.buttonOutlineText}>이전</Text>
            </TouchableOpacity>
          )}
          
          {/* '다음' 또는 '저장하기' 버튼: 마지막 단계인지 확인하여 분기 처리합니다. */}
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, !canProceedToNext() && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!canProceedToNext()}
            >
              <Text style={styles.buttonPrimaryText}>다음</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, !canProceedToNext() && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!canProceedToNext()}
            >
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.buttonPrimaryText}>저장하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
