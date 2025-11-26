/* RHCM 10/22/25
 * src/screens/Preview.js
 * A paged preview of all screens used for visual QA and demo purposes.
 * Renders the app screens in a horizontal FlatList and supplies a dummy
 * navigation object for non-interactive preview pages.
 */
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SCREEN, verticalScale, fontSize } from '../utils/responsive';
import Loading from './Loading';
import Login from './Login';
import Verify from './Verify';
import Dashboard from './Dashboard';
import Task from './Task';
import Forgot from './Forgot';
import Help from './Help';
import Feedback from './Feedback';
import Contacts from './Contacts';

const { WIDTH: width, HEIGHT: height } = SCREEN;

const SCREENS = [
  { key: 'Loading', component: Loading, interactive: false },
  { key: 'Login', component: Login, interactive: false },
  { key: 'Verify', component: Verify, interactive: true },
  { key: 'Dashboard', component: Dashboard, interactive: false },
  { key: 'Task', component: Task, interactive: false },
  { key: 'Forgot', component: Forgot, interactive: false },
  { key: 'Help', component: Help, interactive: false },
  { key: 'Feedback', component: Feedback, interactive: false },
  { key: 'Contacts', component: Contacts, interactive: false },
];

export default function Preview({ navigation }) {
  // Dummy navigation object with no-op methods so rendered screens don't navigate
  const dummyNav = {
    navigate: () => {},
    goBack: () => {},
    replace: () => {},
    push: () => {},
    pop: () => {},
    setParams: () => {}
  };

  const [index, setIndex] = useState(0);
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setIndex(idx);
    }
  }).current;

  const renderItem = useCallback(({ item }) => {
    const Comp = item.component;
    const interactive = !!item.interactive;
    // If interactive, allow pointer events and pass real navigation; otherwise keep inert.
    return (
      <View style={styles.page} pointerEvents={interactive ? 'auto' : 'none'}>
        <Comp navigation={interactive ? navigation : dummyNav} />
      </View>
    );
  }, [navigation]);

  return (
    <View style={styles.root}>
      <FlatList
        data={SCREENS}
        keyExtractor={i => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        initialNumToRender={SCREENS.length}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
      />

      {/* Index label */}
      <View style={styles.indexLabelWrap} pointerEvents="none">
        <Text style={styles.indexLabel}>{index + 1} / {SCREENS.length} — {SCREENS[index].key}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dotsWrap} pointerEvents="none">
        {SCREENS.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index ? styles.dotActive : null]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  page: { width, height },
  hint: { position: 'absolute', bottom: verticalScale(18), left: 0, right: 0, alignItems: 'center' },
  hintText: { color: '#888', fontSize: fontSize(12) }
});
