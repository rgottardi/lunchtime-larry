import React from 'react';
import {
  Platform,
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from './Text';
import clsx from 'clsx';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      style,
      containerClassName,
      ...props
    },
    ref
  ) => {
    if (Platform.OS === 'web') {
      const webClassName = clsx(
        'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
        {
          'w-full': fullWidth,
          'ring-red-300 focus:ring-red-500': error,
          'pl-10': leftIcon,
          'pr-10': rightIcon,
        }
      );

      return (
        <div className={clsx('w-full', containerClassName)}>
          {label && (
            <label
              className="block text-sm font-medium leading-6 text-gray-900 mb-1"
              htmlFor={props.id}
            >
              {label}
            </label>
          )}
          <div className="relative">
            {leftIcon && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {leftIcon}
              </div>
            )}
            <input
              ref={ref as any}
              className={webClassName}
              {...(props as any)}
            />
            {rightIcon && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                {rightIcon}
              </div>
            )}
            {error && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          {(error || helperText) && (
            <p
              className={clsx('mt-2 text-sm', {
                'text-red-600': error,
                'text-gray-500': !error && helperText,
              })}
            >
              {error || helperText}
            </p>
          )}
        </div>
      );
    }

    // React Native styles
    const inputStyles = [
      styles.input,
      error && styles.inputError,
      fullWidth && styles.fullWidth,
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      style,
    ];

    return (
      <View style={[styles.container, fullWidth && styles.fullWidth]}>
        {label && (
          <Text variant="small-semibold" style={styles.label}>
            {label}
          </Text>
        )}
        <View style={styles.inputContainer}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={inputStyles}
            placeholderTextColor="#9CA3AF"
            {...props}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          {error && (
            <View style={styles.rightIcon}>
              <ExclamationCircleIcon color="#EF4444" size={20} />
            </View>
          )}
        </View>
        {(error || helperText) && (
          <Text
            variant="small"
            style={[
              styles.helperText,
              error ? styles.errorText : styles.regularHelperText,
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
    color: '#111827',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    height: '100%',
    justifyContent: 'center',
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
  },
  regularHelperText: {
    color: '#6B7280',
  },
});