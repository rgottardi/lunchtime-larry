import React from 'react';
import { Text as RNText, TextProps as RNTextProps, Platform, StyleSheet } from 'react-native';
import clsx from 'clsx';

const VARIANTS = {
  h1: {
    native: styles.h1,
    web: 'text-4xl font-bold tracking-tight',
  },
  h2: {
    native: styles.h2,
    web: 'text-3xl font-bold tracking-tight',
  },
  h3: {
    native: styles.h3,
    web: 'text-2xl font-bold',
  },
  h4: {
    native: styles.h4,
    web: 'text-xl font-bold',
  },
  body: {
    native: styles.body,
    web: 'text-base',
  },
  'body-bold': {
    native: styles.bodyBold,
    web: 'text-base font-bold',
  },
  'body-semibold': {
    native: styles.bodySemibold,
    web: 'text-base font-semibold',
  },
  small: {
    native: styles.small,
    web: 'text-sm',
  },
  'small-bold': {
    native: styles.smallBold,
    web: 'text-sm font-bold',
  },
  'small-semibold': {
    native: styles.smallSemibold,
    web: 'text-sm font-semibold',
  },
  tiny: {
    native: styles.tiny,
    web: 'text-xs',
  }
} as const;

export interface TextProps extends RNTextProps {
  variant?: keyof typeof VARIANTS;
  align?: 'left' | 'center' | 'right';
  color?: string;
  className?: string;
}

export const Text = React.forwardRef<RNText, TextProps>(
  ({ variant = 'body', align = 'left', color, style, className, ...props }, ref) => {
    if (Platform.OS === 'web') {
      return (
        <RNText
          ref={ref}
          className={clsx(
            VARIANTS[variant].web,
            {
              'text-left': align === 'left',
              'text-center': align === 'center',
              'text-right': align === 'right',
            },
            className
          )}
          style={[color && { color }, style]}
          {...props}
        />
      );
    }

    return (
      <RNText
        ref={ref}
        style={[
          VARIANTS[variant].native,
          {
            textAlign: align,
            color: color || '#000000',
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

const styles = StyleSheet.create({
  h1: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h4: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bodySemibold: {
    fontSize: 16,
    fontWeight: '600',
  },
  small: {
    fontSize: 14,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  smallSemibold: {
    fontSize: 14,
    fontWeight: '600',
  },
  tiny: {
    fontSize: 12,
  },
});