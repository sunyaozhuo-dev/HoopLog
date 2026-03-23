import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Colors, Fonts, FontSizes, Spacing, Radius } from "../constants/theme";
import type { ThemeColors } from "../constants/theme";
import { t } from "../constants/i18n";
import type { PlanItem } from "../contexts/PlansContext";
import type { PlanTemplate } from "../contexts/TemplatesContext";

interface Props {
  items: PlanItem[];
  date: string;
  colors: ThemeColors;
  canToggle: boolean;
  onAdd: (text: string) => void;
  onToggle: (itemId: string) => void;
  onUpdate: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
  templates?: PlanTemplate[];
  onSaveAsTemplate?: (name: string, items: string[]) => void;
  onApplyTemplate?: (items: string[]) => void;
  onDeleteTemplate?: (id: string) => void;
}

export function PlanCard({
  items,
  date,
  colors,
  canToggle,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
  templates,
  onSaveAsTemplate,
  onApplyTemplate,
  onDeleteTemplate,
}: Props) {
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const handleAdd = () => {
    if (!inputText.trim()) return;
    onAdd(inputText.trim());
    setInputText("");
    setShowInput(false);
  };

  const handleStartEdit = (item: PlanItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdate(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const handleToggle = (itemId: string) => {
    onToggle(itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveAsTemplate = () => {
    if (!onSaveAsTemplate || items.length === 0) return;
    Alert.prompt(
      t.saveAsTemplate,
      t.templateName,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.save,
          onPress: (name?: string) => {
            if (name?.trim()) {
              onSaveAsTemplate(name.trim(), items.map((i) => i.text));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  const handleApplyTemplate = (template: PlanTemplate) => {
    if (!onApplyTemplate) return;
    onApplyTemplate(template.items);
    setShowTemplates(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDeleteTemplate = (template: PlanTemplate) => {
    if (!onDeleteTemplate) return;
    Alert.alert(t.deleteTemplateTitle, t.deleteTemplateMsg, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => onDeleteTemplate(template.id),
      },
    ]);
  };

  const doneCount = items.filter((i) => i.done).length;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="clipboard-outline" size={20} color={colors.accent} />
          <Text
            style={[styles.title, { color: colors.text, fontFamily: Fonts.semiBold }]}
          >
            {t.planTitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {items.length > 0 && (
            <Text
              style={[
                styles.progress,
                { color: colors.textSecondary, fontFamily: Fonts.regular },
              ]}
            >
              {doneCount}/{items.length}
            </Text>
          )}
          {items.length > 0 && onSaveAsTemplate && (
            <Pressable onPress={handleSaveAsTemplate} hitSlop={8}>
              <Ionicons name="bookmark-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {items.map((item) => (
        <PlanItemRow
          key={item.id}
          item={item}
          colors={colors}
          canToggle={canToggle}
          editingId={editingId}
          editText={editText}
          onEditTextChange={setEditText}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onToggle={handleToggle}
          onDelete={onDelete}
        />
      ))}

      {showInput ? (
        <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, fontFamily: Fonts.regular }]}
            placeholder={t.planItemPlaceholder}
            placeholderTextColor={colors.inactive}
            value={inputText}
            onChangeText={setInputText}
            autoFocus
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <View style={styles.inputActions}>
            <Pressable
              onPress={() => {
                setShowInput(false);
                setInputText("");
              }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={handleAdd}>
              <Ionicons
                name="checkmark-circle"
                size={26}
                color={inputText.trim() ? colors.accent : colors.inactive}
              />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => setShowInput(true)}
            style={[styles.addBtn, { borderColor: colors.border, flex: 1 }]}
          >
            <Ionicons name="add" size={18} color={colors.accent} />
            <Text
              style={[styles.addText, { color: colors.accent, fontFamily: Fonts.medium }]}
            >
              {t.planAddItem}
            </Text>
          </Pressable>
          {templates && onApplyTemplate && (
            <Pressable
              onPress={() => setShowTemplates(!showTemplates)}
              style={[styles.addBtn, { borderColor: colors.border, flex: 1 }]}
            >
              <Ionicons name="copy-outline" size={16} color={colors.accent} />
              <Text
                style={[styles.addText, { color: colors.accent, fontFamily: Fonts.medium }]}
              >
                {t.fromTemplate}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Template picker */}
      {showTemplates && templates && (
        <View style={[styles.templateList, { borderColor: colors.border }]}>
          {templates.length === 0 ? (
            <Text
              style={[
                styles.noTemplates,
                { color: colors.textSecondary, fontFamily: Fonts.regular },
              ]}
            >
              {t.noTemplates}
            </Text>
          ) : (
            templates.map((tmpl) => (
              <View
                key={tmpl.id}
                style={[styles.templateRow, { borderColor: colors.border }]}
              >
                <Pressable
                  onPress={() => handleApplyTemplate(tmpl)}
                  style={styles.templateInfo}
                >
                  <Text
                    style={[
                      styles.templateName,
                      { color: colors.text, fontFamily: Fonts.medium },
                    ]}
                  >
                    {tmpl.name}
                  </Text>
                  <Text
                    style={[
                      styles.templateCount,
                      { color: colors.textSecondary, fontFamily: Fonts.regular },
                    ]}
                  >
                    {t.upcomingItems(tmpl.items.length)}
                  </Text>
                </Pressable>
                {onDeleteTemplate && (
                  <Pressable
                    onPress={() => handleDeleteTemplate(tmpl)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

function PlanItemRow({
  item,
  colors,
  canToggle,
  editingId,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onToggle,
  onDelete,
}: {
  item: PlanItem;
  colors: ThemeColors;
  canToggle: boolean;
  editingId: string | null;
  editText: string;
  onEditTextChange: (t: string) => void;
  onStartEdit: (item: PlanItem) => void;
  onSaveEdit: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActions}>
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            onStartEdit(item);
          }}
          style={styles.editBtn}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            Alert.alert(t.deletePlanItemTitle, t.deletePlanItemMsg, [
              { text: t.cancel, style: "cancel" },
              { text: t.delete, style: "destructive", onPress: () => onDelete(item.id) },
            ]);
          }}
          style={styles.deleteBtn}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  if (editingId === item.id) {
    return (
      <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text, fontFamily: Fonts.regular }]}
          value={editText}
          onChangeText={onEditTextChange}
          autoFocus
          onSubmitEditing={onSaveEdit}
          returnKeyType="done"
        />
        <Pressable onPress={onSaveEdit}>
          <Ionicons name="checkmark-circle" size={26} color={colors.accent} />
        </Pressable>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <Pressable
        onPress={() => canToggle && onToggle(item.id)}
        style={styles.itemRow}
      >
        <Ionicons
          name={item.done ? "checkbox" : "square-outline"}
          size={22}
          color={item.done ? colors.accent : colors.inactive}
        />
        <Text
          style={[
            styles.itemText,
            {
              color: item.done ? colors.textSecondary : colors.text,
              fontFamily: Fonts.regular,
              textDecorationLine: item.done ? "line-through" : "none",
            },
          ]}
        >
          {item.text}
        </Text>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: { fontSize: FontSizes.md },
  progress: { fontSize: FontSizes.sm },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  itemText: { fontSize: FontSizes.md, flex: 1 },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addText: { fontSize: FontSizes.sm },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  input: { flex: 1, fontSize: FontSizes.md, paddingVertical: Spacing.xs },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  swipeActions: {
    flexDirection: "row",
    marginLeft: Spacing.xs,
  },
  editBtn: {
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    borderRadius: Radius.sm,
    marginRight: 2,
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    borderRadius: Radius.sm,
  },
  templateList: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: { fontSize: FontSizes.sm },
  templateCount: { fontSize: FontSizes.xs, marginTop: 2 },
  noTemplates: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
});
