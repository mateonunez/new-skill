import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { FieldBox, KeyHints, StepHeader } from '../components.js';
import { T } from '../theme.js';
import type { SkillConfig } from '../types/skill.js';

type Features = SkillConfig['features'];

interface FeatureItem {
  key: keyof Features;
  label: string;
  desc: string;
}

const FEATURE_ITEMS: FeatureItem[] = [
  { key: 'rules', label: 'Rules', desc: 'Incorrect/correct code pattern examples' },
  { key: 'evals', label: 'Evals', desc: 'Test prompts with expected outputs' },
  { key: 'agents', label: 'Agent Config', desc: 'Custom name, description, and icon' },
  { key: 'assets', label: 'Assets', desc: 'Icons and visual assets' },
];

const CONTINUE_IDX = FEATURE_ITEMS.length;
const TOTAL_ITEMS = FEATURE_ITEMS.length + 1;

interface FeaturesProps {
  initialFeatures?: Features;
  initialAgentDisplayName?: string;
  onNext: (features: Features, agentDisplayName: string) => void;
  onBack: () => void;
}

export function Features({
  initialFeatures = { rules: false, evals: false, agents: false, assets: false },
  initialAgentDisplayName = '',
  onNext,
  onBack,
}: FeaturesProps) {
  const [features, setFeatures] = useState<Features>(initialFeatures);
  const [cursor, setCursor] = useState(0);
  const [focusZone, setFocusZone] = useState<'list' | 'agentName'>('list');
  const [agentDisplayName, setAgentDisplayName] = useState(initialAgentDisplayName);

  const doNext = () => onNext(features, agentDisplayName);

  useInput((input, key) => {
    if (key.escape) {
      if (focusZone === 'agentName') {
        setFocusZone('list');
      } else {
        onBack();
      }
      return;
    }

    if (key.ctrl && input === 's') {
      if (features.agents && !agentDisplayName.trim()) {
        setFocusZone('agentName');
      } else {
        doNext();
      }
      return;
    }

    if (focusZone === 'list') {
      if (key.upArrow || input === 'k') {
        setCursor((c) => Math.max(0, c - 1));
        return;
      }
      if (key.downArrow || input === 'j') {
        setCursor((c) => Math.min(TOTAL_ITEMS - 1, c + 1));
        return;
      }
      if (input === ' ') {
        if (cursor < FEATURE_ITEMS.length) {
          const featureKey = FEATURE_ITEMS[cursor]!.key;
          setFeatures((f) => ({ ...f, [featureKey]: !f[featureKey] }));
        }
        return;
      }
      if (key.return) {
        if (cursor === CONTINUE_IDX) {
          if (features.agents && !agentDisplayName.trim()) {
            setFocusZone('agentName');
          } else {
            doNext();
          }
        } else {
          const featureKey = FEATURE_ITEMS[cursor]!.key;
          setFeatures((f) => ({ ...f, [featureKey]: !f[featureKey] }));
        }
        return;
      }
      if (key.tab) {
        if (features.agents) {
          setFocusZone('agentName');
        } else {
          doNext();
        }
        return;
      }
    }

    if (focusZone === 'agentName') {
      if (key.tab) {
        setFocusZone('list');
        return;
      }
    }
  });

  const handleAgentNameSubmit = (value: string) => {
    setAgentDisplayName(value.trim());
    doNext();
  };

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title="Step 3 — Optional Features"
        subtitle="Choose which files and directories to scaffold."
      />

      <FieldBox
        title="Features"
        focused={focusZone === 'list'}
        marginTop={1}
        padding={1}
        flexShrink={0}
      >
        {FEATURE_ITEMS.map((item, i) => (
          <Text key={item.key}>
            <Text color={cursor === i && focusZone === 'list' ? T.accentText : T.textDim}>
              {cursor === i && focusZone === 'list' ? '> ' : '  '}
            </Text>
            <Text color={features[item.key] ? T.success : T.textDim}>
              {features[item.key] ? '●' : '○'}
            </Text>
            {'  '}
            <Text color={cursor === i && focusZone === 'list' ? T.text : T.textMuted}>
              {item.label.padEnd(14)}
            </Text>
            <Text color={T.textDim}>{item.desc}</Text>
          </Text>
        ))}

        <Text color={T.textDim}>
          {'  ─────────────────────────────────────────────────────'}
        </Text>

        <Text>
          <Text color={cursor === CONTINUE_IDX && focusZone === 'list' ? T.accentText : T.textDim}>
            {cursor === CONTINUE_IDX && focusZone === 'list' ? '> ' : '  '}
          </Text>
          <Text color={cursor === CONTINUE_IDX && focusZone === 'list' ? T.success : T.textDim}>
            {'Continue →'}
          </Text>
        </Text>
      </FieldBox>

      {features.agents && (
        <FieldBox title="Agent Display Name" focused={focusZone === 'agentName'} height={3}>
          <TextInput
            placeholder="TypeScript Expert, API Designer, Code Reviewer..."
            focus={focusZone === 'agentName'}
            value={agentDisplayName}
            onChange={setAgentDisplayName}
            onSubmit={handleAgentNameSubmit}
          />
        </FieldBox>
      )}

      <KeyHints
        hints={[
          { key: '↑↓ / j k', label: 'Move' },
          { key: 'Space', label: 'Toggle' },
          { key: 'Enter', label: 'Select' },
          { key: 'Ctrl+S', label: 'Continue' },
          { key: 'Esc', label: 'Back' },
        ]}
      />
    </Box>
  );
}
