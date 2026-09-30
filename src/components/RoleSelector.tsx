import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Factory, Search } from 'lucide-react-native';
import { useMarketplace } from '@/hooks/use-marketplace';

export function RoleSelector() {
  const { currentAction, selectAction } = useMarketplace();

  const isPost = currentAction === 'POST_WORK';
  const isFind = currentAction === 'FIND_WORK';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.roleBtn, isPost && styles.roleBtnActivePost]}
        onPress={() => selectAction('POST_WORK')}
      >
        <Factory size={13} color={isPost ? '#2563EB' : '#64748B'} />
        <Text style={[styles.roleText, isPost && styles.roleTextActivePost]}>
          Post Work
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleBtn, isFind && styles.roleBtnActiveFind]}
        onPress={() => selectAction('FIND_WORK')}
      >
        <Search size={13} color={isFind ? '#16A34A' : '#64748B'} />
        <Text style={[styles.roleText, isFind && styles.roleTextActiveFind]}>
          Find Work
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
    marginVertical: 4,
    gap: 4,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 6,
  },
  roleBtnActivePost: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  roleBtnActiveFind: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTextActivePost: {
    color: '#2563EB',
    fontWeight: '800',
  },
  roleTextActiveFind: {
    color: '#16A34A',
    fontWeight: '800',
  },
});
