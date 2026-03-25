// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'person.fill': 'person',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Categories
  'wrench.fill': 'build',
  'leaf.fill': 'eco',
  'car.fill': 'directions-car',
  'building.2.fill': 'account-balance',
  'shield.fill': 'shield',
  'ellipsis.circle.fill': 'more-horiz',
  // People
  'person.2.fill': 'people',
  // Actions
  'magnifyingglass': 'search',
  'line.3.horizontal.decrease.circle': 'filter-list',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'envelope.fill': 'email',
  'mappin.circle.fill': 'location-on',
  'plus.circle.fill': 'add-circle',
  'list.bullet': 'format-list-bulleted',
  'map.fill': 'map',
  'doc.text.fill': 'description',
  'square.and.arrow.up': 'share',
  // Detail screen
  'chevron.left': 'arrow-back',
  'clock.fill': 'schedule',
  'text.bubble.fill': 'chat-bubble',
  'person.circle.fill': 'account-circle',
  // Camera/Photos
  'camera.fill': 'photo-camera',
  'photo.on.rectangle': 'photo-library',
  // Forms
  'checkmark': 'check',
  'chevron.down': 'expand-more',
  // Wizard / Create
  'wand.and.stars': 'auto-awesome',
  'plus': 'add',
  'checkmark.circle.fill': 'check-circle',
  'circle': 'radio-button-unchecked',
  'xmark': 'close',
  'mappin.and.ellipse': 'place',
  // Profile
  'flame.fill': 'local-fire-department',
  'pencil': 'edit',
  'gearshape.fill': 'settings',
  'chart.bar.fill': 'leaderboard',
  'rectangle.portrait.and.arrow.right': 'logout',
  'star.fill': 'star',
  'trophy.fill': 'emoji-events',
  // Comments
  'arrowshape.turn.up.left': 'reply',
  'trash': 'delete',
  'hand.thumbsup': 'thumb-up',
  'hand.thumbsup.fill': 'thumb-up',
  // Activity
  'bell.fill': 'notifications',
  // Reporting & Blocking
  'flag.fill': 'flag',
  'nosign': 'block',
  // Misc
  'exclamationmark.triangle.fill': 'warning',
  'arrow.clockwise': 'refresh',
  'xmark.circle.fill': 'cancel',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
