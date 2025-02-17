import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import clsx from 'clsx';

interface SpinWheelProps {
  options: Array<{
    id: string;
    label: string;
    color: string;
  }>;
  width?: number;
  height?: number;
  spinning?: boolean;
  onSpinEnd?: (selectedId: string) => void;
  className?: string;
}

export const SpinWheel = ({
  options,
  width = 300,
  height = 300,
  spinning = false,
  onSpinEnd,
  className,
}: SpinWheelProps) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const isSpinning = useRef(false);

  useEffect(() => {
    if (spinning && !isSpinning.current) {
      isSpinning.current = true;
      // Generate random number of full rotations (3-5) plus random angle
      const rotations = 3 + Math.random() * 2;
      const randomAngle = Math.random() * 360;
      const finalRotation = rotations * 360 + randomAngle;

      // Calculate which option will be selected
      const finalAngle = (currentRotation.current + finalRotation) % 360;
      const segmentSize = 360 / options.length;
      const selectedIndex = Math.floor(finalAngle / segmentSize);
      const selectedOption = options[options.length - 1 - selectedIndex];

      Animated.timing(spinValue, {
        toValue: finalRotation / 360,
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        isSpinning.current = false;
        currentRotation.current = finalAngle;
        onSpinEnd?.(selectedOption.id);
      });
    }
  }, [spinning, options, spinValue, onSpinEnd]);

  const segmentSize = 360 / options.length;
  const radius = Math.min(width, height) / 2;
  const center = { x: width / 2, y: height / 2 };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (Platform.OS === 'web') {
    return (
      <div className={clsx('relative', className)}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="transform transition-transform duration-[3000ms]"
          style={{
            transform: `rotate(${spin}deg)`,
          }}
        >
          <g transform={`translate(${center.x},${center.y})`}>
            {options.map((option, index) => {
              const startAngle = index * segmentSize;
              const endAngle = (index + 1) * segmentSize;
              const midAngle = (startAngle + endAngle) / 2;
              
              // Calculate path
              const x1 = radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = radius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = segmentSize > 180 ? 1 : 0;

              const path = `
                M 0 0
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;

              // Calculate text position
              const textRadius = radius * 0.6;
              const textX = textRadius * Math.cos((midAngle * Math.PI) / 180);
              const textY = textRadius * Math.sin((midAngle * Math.PI) / 180);

              return (
                <g key={option.id}>
                  <path
                    d={path}
                    fill={option.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    className="text-sm font-medium fill-white"
                    style={{
                      filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))',
                    }}
                  >
                    {option.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        {/* Arrow indicator */}
        <div className="absolute top-0 left-1/2 -ml-4 w-8 h-8">
          <svg
            viewBox="0 0 32 32"
            className="w-full h-full drop-shadow-lg"
          >
            <path
              d="M16 0L32 32H0L16 0Z"
              fill="#EF4444"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View
        style={[
          styles.wheel,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <G transform={`translate(${center.x},${center.y})`}>
            {options.map((option, index) => {
              const startAngle = index * segmentSize;
              const endAngle = (index + 1) * segmentSize;
              const midAngle = (startAngle + endAngle) / 2;
              
              // Calculate path
              const x1 = radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = radius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = segmentSize > 180 ? 1 : 0;

              const path = `
                M 0 0
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;

              // Calculate text position
              const textRadius = radius * 0.6;
              const textX = textRadius * Math.cos((midAngle * Math.PI) / 180);
              const textY = textRadius * Math.sin((midAngle * Math.PI) / 180);

              return (
                <G key={option.id}>
                  <Path
                    d={path}
                    fill={option.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <SvgText
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="500"
                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  >
                    {option.label}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </Animated.View>
      {/* Arrow indicator */}
      <View style={styles.indicator}>
        <Svg width={32} height={32} viewBox="0 0 32 32">
          <Path
            d="M16 0L32 32H0L16 0Z"
            fill="#EF4444"
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: '100%',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});