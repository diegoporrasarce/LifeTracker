import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import type { PortfolioPoint } from '@/store/selectors';
import { MONTH_NAMES_SHORT, monthLabel, parseMonthKey } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

const PADDING_LEFT = 48;
const PADDING_RIGHT = 14;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 26;

interface PortfolioChartProps {
  data: PortfolioPoint[];
  height?: number;
}

/**
 * Area chart of the portfolio evolution.
 *
 * Only the total of each month is plotted: the app does not split the money
 * between cash and invested, so the chart shows a single line and area.
 */
export function PortfolioChart({ data, height = 220 }: PortfolioChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const geometry = useMemo(() => {
    const innerWidth = Math.max(0, width - PADDING_LEFT - PADDING_RIGHT);
    const innerHeight = Math.max(0, height - PADDING_TOP - PADDING_BOTTOM);
    const maxValue = Math.max(1, ...data.map((point) => point.total));
    const top = maxValue * 1.08;

    const xFor = (index: number) => {
      if (data.length <= 1) return PADDING_LEFT + innerWidth / 2;
      return PADDING_LEFT + (index / (data.length - 1)) * innerWidth;
    };
    const yFor = (value: number) => PADDING_TOP + innerHeight * (1 - value / top);

    const totalLine = data.map((point, index) => `${xFor(index)},${yFor(point.total)}`).join(' L ');
    const totalArea = data.length
      ? `M ${PADDING_LEFT},${yFor(0)} L ${totalLine} L ${xFor(data.length - 1)},${yFor(0)} Z`
      : '';

    const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * top);

    return { innerWidth, innerHeight, top, xFor, yFor, totalArea, totalLine, gridValues };
  }, [data, height, width]);

  const handleTouch = (locationX: number) => {
    if (data.length === 0 || geometry.innerWidth <= 0) return;
    const ratio = (locationX - PADDING_LEFT) / geometry.innerWidth;
    const index = Math.round(ratio * (data.length - 1));
    setSelected(Math.max(0, Math.min(data.length - 1, index)));
  };

  const activeIndex = selected !== null ? selected : data.length - 1;
  const activePoint = data[activeIndex];

  // Show at most 7 x-axis labels to avoid overlaps.
  const labelStep = Math.max(1, Math.ceil(data.length / 7));
  if (data.length === 0) {
    return (
      <View
        style={[styles.placeholder, { height, borderRadius: theme.radius.md }]}
        onLayout={handleLayout}>
        <Text style={[theme.typography.body, { color: theme.colors.textTertiary }]}>
          Todavía no hay balances registrados.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.chartWrapper} onLayout={handleLayout}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.colors.primary} stopOpacity={0.35} />
                <Stop offset="1" stopColor={theme.colors.primary} stopOpacity={0.08} />
              </LinearGradient>
            </Defs>

            <G>
              {geometry.gridValues.map((value, index) => {
                const y = geometry.yFor(value);
                return (
                  <G key={`grid-${index}`}>
                    <Line
                      x1={PADDING_LEFT}
                      y1={y}
                      x2={width - PADDING_RIGHT}
                      y2={y}
                      stroke={theme.colors.border}
                      strokeWidth={index === 0 ? 1 : StyleSheet.hairlineWidth}
                    />
                    <SvgText
                      x={PADDING_LEFT - 8}
                      y={y + 4}
                      fontSize={10}
                      fill={theme.colors.textTertiary}
                      textAnchor="end">
                      {formatCurrency(value, { compact: true, decimals: 0 })}
                    </SvgText>
                  </G>
                );
              })}

              {geometry.totalArea ? (
                <Path d={geometry.totalArea} fill="url(#totalFill)" />
              ) : null}
              {geometry.totalLine ? (
                <Path
                  d={`M ${geometry.totalLine}`}
                  stroke={theme.colors.text}
                  strokeWidth={2}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}

              {data.map((point, index) => (
                <Circle
                  key={`dot-${point.month}`}
                  cx={geometry.xFor(index)}
                  cy={geometry.yFor(point.total)}
                  r={index === activeIndex ? 4.5 : 2.5}
                  fill={theme.colors.surface}
                  stroke={theme.colors.text}
                  strokeWidth={index === activeIndex ? 2 : 1.5}
                />
              ))}

              {data.map((point, index) =>
                index % labelStep === 0 || index === data.length - 1 ? (
                  <SvgText
                    key={`label-${point.month}`}
                    x={geometry.xFor(index)}
                    y={height - 8}
                    fontSize={10}
                    fill={theme.colors.textTertiary}
                    textAnchor="middle">
                    {MONTH_NAMES_SHORT[parseMonthKey(point.month).month]}
                  </SvgText>
                ) : null,
              )}
            </G>
          </Svg>
        ) : null}

        <View
          style={styles.touchLayer}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(event) => handleTouch(event.nativeEvent.locationX)}
          onResponderMove={(event) => handleTouch(event.nativeEvent.locationX)}
          onResponderRelease={() => setSelected(null)}
        />
      </View>

      {activePoint ? (
        <View style={styles.tooltipRow}>
          <View>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {monthLabel(activePoint.month)}
            </Text>
            <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
              {formatCurrency(activePoint.total)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
  },
});
