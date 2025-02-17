import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from './Text';
import clsx from 'clsx';

const VARIANTS = {
  primary: {
    base: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    active: 'active:bg-indigo-800',
    disabled: 'bg-indigo-300',
    text: 'text-white',
  },
  secondary: {
    base: 'bg-white border border-gray-300',
    hover: 'hover:bg-gray-50',
    active: 'active:bg-gray-100',
    disabled: 'bg-gray-100',
    text: 'text-gray-700',
  },
  danger: {
    base: 'bg-red-600',
    hover: 'hover:bg-red-700',
    active: 'active:bg-red-800',
    disabled: 'bg-red-300',
    text: 'text-white',
  },
} as const;

const SIZES = {
  sm: {
    button: 'px-3 py-2',
    text: 'text-sm',
  },
  md: {
    button: 'px-4 py-2',
    text: 'text-base',
  },
  lg: {
    button: 'px-6 py-3',
    text: 'text-lg',
  },
} as const;

export interface ButtonProps extends TouchableOpacityProps {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const variantStyles = VARIANTS[variant];
    const sizeStyles = SIZES[size];

    if (Platform.OS === 'web') {
      const webClassName = clsx(
        'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        variantStyles.base,
        variantStyles.hover,
        variantStyles.active,
        sizeStyles.button,
        {
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled || loading,
          [variantStyles.disabled]: disabled,
        }
      );

      return (
        <button
          className={webClassName}
          disabled={disabled || loading}
          {...(props as any)}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color={variant === 'secondary' ? '#4F46E5' : '#FFFFFF'}
              style={styles.spinner}
            />
          )}
          {!loading && leftIcon}
          <Text
            style={[
              { color: variant === 'secondary' ? '#374151' : '#FFFFFF' },
              styles.text,
            ]}
            className={clsx(sizeStyles.text, variantStyles.text)}
          >
            {children}
          </Text>
          {!loading && rightIcon}
        </button>
      );
    }

    // React Native styles
    const nativeStyles = [
      styles.button,
      {
        backgroundColor:
          disabled || loading
            ? variantStyles.disabled
            : variantStyles.base.split('-')[1],
      },
      fullWidth && styles.fullWidth,
      style,
    ];

    return (
      <TouchableOpacity
        ref={ref}
        style={nativeStyles}
        disabled={disabled || loading}
        {...props}
      >
        <View style={styles.content}>
          {loading && (
            <ActivityIndicator
              size="small"
              color={variant === 'secondary' ? '#4F46E5' : '#FFFFFF'}
              style={styles.spinner}
            />
          )}
          {!loading && leftIcon}
          <Text
            style={[
              { color: variant === 'secondary' ? '#374151' : '#FFFFFF' },
              styles.text,
            ]}
          >
            {children}
          </Text>
          {!loading && rightIcon}
        </View>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '500',
  },
  spinner: {
    marginRight: 8,
  },
});