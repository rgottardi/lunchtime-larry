import React from 'react';
import {
  Platform,
  View,
  ViewProps,
  StyleSheet,
  Pressable,
  PressableProps,
} from 'react-native';
import clsx from 'clsx';
import { Text } from './Text';

export interface CardProps extends ViewProps {
  onPress?: PressableProps['onPress'];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
}

const PADDING = {
  none: 0,
  small: 12,
  medium: 16,
  large: 24,
};

const SHADOWS = {
  none: {},
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const Card = React.forwardRef<View, CardProps>(
  (
    {
      children,
      onPress,
      header,
      footer,
      padding = 'medium',
      shadow = 'medium',
      style,
      className,
      ...props
    },
    ref
  ) => {
    const Wrapper = onPress ? Pressable : View;
    const wrapperProps = onPress
      ? {
          onPress,
          android_ripple: { color: 'rgba(0, 0, 0, 0.1)' },
        }
      : {};

    if (Platform.OS === 'web') {
      const webClassName = clsx(
        'bg-white rounded-lg border border-gray-200',
        {
          'shadow-sm': shadow === 'small',
          'shadow-md': shadow === 'medium',
          'shadow-lg': shadow === 'large',
          'p-3': padding === 'small',
          'p-4': padding === 'medium',
          'p-6': padding === 'large',
          'hover:bg-gray-50': onPress,
        },
        className
      );

      return (
        <Wrapper
          ref={ref as any}
          className={webClassName}
          {...wrapperProps}
          {...props}
        >
          {header && (
            <div className="px-4 py-5 sm:px-6 -mx-4 -mt-4 mb-4 border-b border-gray-200">
              {header}
            </div>
          )}
          {children}
          {footer && (
            <div className="px-4 py-4 sm:px-6 -mx-4 -mb-4 mt-4 bg-gray-50 border-t border-gray-200">
              {footer}
            </div>
          )}
        </Wrapper>
      );
    }

    // React Native styles
    const cardStyles = [
      styles.card,
      SHADOWS[shadow],
      {
        padding: PADDING[padding],
      },
      style,
    ];

    return (
      <Wrapper
        ref={ref}
        style={cardStyles}
        {...wrapperProps}
        {...props}
      >
        {header && (
          <View style={styles.header}>
            {header}
          </View>
        )}
        {children}
        {footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </Wrapper>
    );
  }
);

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  header: {
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  footer: {
    marginHorizontal: -16,
    marginBottom: -16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});