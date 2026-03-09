import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { IssueMiniCard } from '@/components/issue-mini-card';
import { ThemedText } from '@/components/themed-text';
import { Localization } from '@/constants/localization';
import { Spacing } from '@/constants/spacing';
import { BrandColors, CategoryColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { IssueListResponse } from '@/types/issues';

type MappableIssue = IssueListResponse & { latitude: number; longitude: number };

type IssueMapViewProps = {
  issues: IssueListResponse[];
  onIssuePress: (id: string) => void;
};

/** Bucharest center */
const INITIAL_REGION = {
  latitude: 44.4268,
  longitude: 26.1025,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function IssueMapView({ issues, onIssuePress }: IssueMapViewProps) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const [selectedIssue, setSelectedIssue] = useState<IssueListResponse | null>(
    null,
  );

  const mappableIssues = useMemo(
    () =>
      issues.filter((i): i is MappableIssue =>
        i.latitude != null && i.longitude != null,
      ),
    [issues],
  );

  const handleMarkerPress = useCallback(
    (issue: MappableIssue) => {
      setSelectedIssue(issue);
    },
    [],
  );

  const handleMapPress = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  const handleClusterPress = useCallback(
    (_cluster: unknown, _markers?: unknown[]) => {
      setSelectedIssue(null);
    },
    [],
  );

  const handleMiniCardPress = useCallback(() => {
    if (selectedIssue) onIssuePress(selectedIssue.id);
  }, [selectedIssue, onIssuePress]);

  const handleMiniCardClose = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  return (
    <View style={styles.container}>
      <ClusteredMapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        onPress={handleMapPress}
        onClusterPress={handleClusterPress}
        clusterColor={BrandColors.orangeWeb}
        clusterTextColor={BrandColors.oxfordBlue}
        minPoints={2}
        radius={100}
        animationEnabled
      >
        {mappableIssues.map((issue) => (
          <IssueMarker
            key={issue.id}
            issue={issue}
            onPress={handleMarkerPress}
          />
        ))}
      </ClusteredMapView>

      {/* Empty state overlay */}
      {mappableIssues.length === 0 && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <ThemedText type="caption" style={{ color: textSecondary }}>
            {Localization.map.noPins}
          </ThemedText>
        </View>
      )}

      {/* Mini card overlay */}
      {selectedIssue && (
        <IssueMiniCard
          issue={selectedIssue}
          onPress={handleMiniCardPress}
          onClose={handleMiniCardClose}
        />
      )}
    </View>
  );
}

// Memoized to skip reconciliation when selectedIssue changes but markers don't
const IssueMarker = React.memo(function IssueMarker({
  issue,
  onPress,
}: {
  issue: MappableIssue;
  onPress: (issue: MappableIssue) => void;
}) {
  const handlePress = useCallback(() => onPress(issue), [onPress, issue]);

  return (
    <Marker
      coordinate={{
        latitude: issue.latitude,
        longitude: issue.longitude,
      }}
      pinColor={CategoryColors[issue.category] ?? CategoryColors.Other}
      tracksViewChanges={false}
      onPress={handlePress}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
