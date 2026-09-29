import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Wrench, Plane } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace } from '@/hooks/use-marketplace';

export function RoleSelector() {
  const theme = useTheme();
  const { userRole, toggleRole } = useMarketplace();

  const isM = userRole === 'manufacturer';

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Active role: Manufacturer. Press to toggle."
        style={[styles.roleBtn, isM && { backgroundColor: theme.backgroundSelected }]}
        onPress={isM ? undefined : toggleRole}
      >
        <Wrench size={13} color={isM ? theme.primary : theme.textSecondary} />
        <Text style={[styles.roleText, { color: isM ? theme.text : theme.textSecondary, fontWeight: isM ? '700' : '600' }]}>
          Manufacturer
        </Text>
      </Pressable>
      
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Active role: Exporter. Press to toggle."
        style={[styles.roleBtn, !isM && { backgroundColor: theme.backgroundSelected }]}
        onPress={!isM ? undefined : toggleRole}
      >
        <Plane size={13} color={!isM ? theme.primary : theme.textSecondary} />
        <Text style={[styles.roleText, { color: !isM ? theme.text : theme.textSecondary, fontWeight: !isM ? '700' : '600' }]}>
          Exporter
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 3,
    marginVertical: 4,
    gap: 2,
    zIndex: 10,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  roleText: {
    fontSize: 12,
  },
});
