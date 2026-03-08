import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { FieldBox, KeyHints, StepHeader } from '../components.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { T } from '../theme.js';
import { AGENT_TARGETS, type AgentTarget, type SkillConfig } from '../types/skill.js';

type Features = SkillConfig['features'];

interface FeatureItem {
  key: keyof Features;
  label: string;
  desc: string;
}

const FEATURE_ITEMS: FeatureItem[] = [
  { key: 'rules', label: 'Rules', desc: 'Incorrect/correct code pattern examples' },
  { key: 'evals', label: 'Evals', desc: 'Test prompts with expected outputs' },
  { key: 'agentsMd', label: 'AGENTS.md', desc: 'Universal instructions (Vercel/Codex ecosystem)' },
  { key: 'assets', label: 'Assets', desc: 'Icons and visual assets placeholder' },
  { key: 'agents', label: 'Agent Config', desc: 'Per-agent YAML configs (openai, claude-code…)' },
];

const CONTINUE_IDX = FEATURE_ITEMS.length;
const TOTAL_ITEMS = FEATURE_ITEMS.length + 1; // items + Continue

type FocusZone = 'list' | 'agentTargets' | 'agentName';

interface FeaturesProps {
  initialFeatures?: Features;
  initialAgentDisplayName?: string;
  initialAgentTargets?: AgentTarget[];
  onNext: (features: Features, agentDisplayName: string, agentTargets: AgentTarget[]) => void;
  onBack: () => void;
  stepNumber?: number;
}

export function Features({
  initialFeatures = { rules: false, evals: false, agents: false, assets: false, agentsMd: false },
  initialAgentDisplayName = '',
  initialAgentTargets = ['openai'],
  onNext,
  onBack,
  stepNumber,
}: FeaturesProps) {
  const [features, setFeatures] = useState<Features>(initialFeatures);
  const [cursor, setCursor] = useState(0);
  const [focusZone, setFocusZone] = useState<FocusZone>('list');
  const [agentCursor, setAgentCursor] = useState(0);
  const [agentTargets, setAgentTargets] = useState<AgentTarget[]>(initialAgentTargets);
  const [agentDisplayName, setAgentDisplayName] = useState(initialAgentDisplayName);

  const doNext = () => onNext(features, agentDisplayName, agentTargets);

  const toggleFeature = (idx: number) => {
    const item = FEATURE_ITEMS[idx];
    if (!item) return;
    setFeatures((f) => ({ ...f, [item.key]: !f[item.key] }));
  };

  const toggleAgentTarget = (id: AgentTarget) => {
    setAgentTargets((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  useInput((input, key) => {
    // ------- Global -------
    if (key.ctrl && input === 's') {
      doNext();
      return;
    }

    // ------- Agent targets sub-list -------
    if (focusZone === 'agentTargets') {
      if (key.escape || (key.tab && key.shift)) {
        setFocusZone('list');
        return;
      }
      if (key.upArrow || input === 'k') {
        setAgentCursor((c) => Math.max(0, c - 1));
        return;
      }
      if (key.downArrow || input === 'j') {
        setAgentCursor((c) => Math.min(AGENT_TARGETS.length - 1, c + 1));
        return;
      }
      if (input === ' ' || key.return) {
        const target = AGENT_TARGETS[agentCursor];
        if (target) toggleAgentTarget(target.id);
        return;
      }
      if (key.tab) {
        setFocusZone('agentName');
        return;
      }
      return;
    }

    // ------- Agent display name input -------
    if (focusZone === 'agentName') {
      if (key.escape) {
        setFocusZone(features.agents ? 'agentTargets' : 'list');
        return;
      }
      if (key.tab && key.shift) {
        setFocusZone(features.agents ? 'agentTargets' : 'list');
        return;
      }
      if (key.tab) {
        setFocusZone('list');
        return;
      }
      return;
    }

    // ------- Main feature list -------
    if (key.escape) {
      onBack();
      return;
    }
    if (key.upArrow || input === 'k') {
      setCursor((c) => Math.max(0, c - 1));
      return;
    }
    if (key.downArrow || input === 'j') {
      setCursor((c) => Math.min(TOTAL_ITEMS - 1, c + 1));
      return;
    }
    if (input === ' ' || key.return) {
      if (cursor === CONTINUE_IDX) {
        doNext();
      } else {
        toggleFeature(cursor);
        // If "Agent Config" was just toggled on, jump to target picker
        const item = FEATURE_ITEMS[cursor];
        const willBeEnabled = item ? !features[item.key] : false;
        if (item?.key === 'agents' && willBeEnabled) {
          setFocusZone('agentTargets');
        }
      }
      return;
    }
    if (key.tab) {
      // Tab forward: list → agentTargets (if agents on) → agentName (if agents on) → list
      if (features.agents && focusZone === 'list') {
        setFocusZone('agentTargets');
      } else {
        setFocusZone('list');
      }
      return;
    }
  });

  const handleAgentNameSubmit = () => {
    doNext();
  };

  const { rows } = useTerminalSize();
  const compact = rows < 34;

  const title = stepNumber ? `Step ${stepNumber} — Optional Features` : 'Optional Features';

  const showAgentTargets = features.agents && (!compact || focusZone === 'agentTargets');
  const showAgentName = features.agents && (!compact || focusZone === 'agentName');
  const showFeaturesList = !compact || focusZone === 'list';

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader title={title} subtitle="Choose which files and directories to scaffold." />

      {showFeaturesList && (
        <FieldBox
          title="Features"
          focused={focusZone === 'list'}
          marginTop={1}
          padding={1}
          flexShrink={0}
        >
          {FEATURE_ITEMS.map((item, i) => {
            const active = cursor === i && focusZone === 'list';
            const enabled = features[item.key];
            return (
              <Text key={item.key}>
                <Text color={active ? T.accentText : T.textDim}>{active ? '> ' : '  '}</Text>
                <Text color={enabled ? T.success : T.textDim}>{enabled ? '●' : '○'}</Text>
                {'  '}
                <Text color={active ? T.text : T.textMuted}>{item.label.padEnd(16)}</Text>
                <Text color={T.textDim}>{item.desc}</Text>
              </Text>
            );
          })}

          <Text color={T.textDim}>{'  ─────────────────────────────────────────────────────'}</Text>

          <Text>
            <Text
              color={cursor === CONTINUE_IDX && focusZone === 'list' ? T.accentText : T.textDim}
            >
              {cursor === CONTINUE_IDX && focusZone === 'list' ? '> ' : '  '}
            </Text>
            <Text color={cursor === CONTINUE_IDX && focusZone === 'list' ? T.success : T.textDim}>
              {'Continue →'}
            </Text>
            <Text color={T.textDim}>{'  [Enter]'}</Text>
          </Text>
        </FieldBox>
      )}

      {showAgentTargets && (
        <FieldBox
          title="Agent Targets"
          focused={focusZone === 'agentTargets'}
          padding={1}
          flexShrink={0}
        >
          {AGENT_TARGETS.map((t, i) => {
            const active = agentCursor === i && focusZone === 'agentTargets';
            const selected = agentTargets.includes(t.id);
            return (
              <Text key={t.id}>
                <Text color={active ? T.accentText : T.textDim}>{active ? '> ' : '  '}</Text>
                <Text color={selected ? T.success : T.textDim}>{selected ? '●' : '○'}</Text>
                {'  '}
                <Text color={active ? T.text : T.textMuted}>{t.label.padEnd(18)}</Text>
                <Text color={T.textDim}>{t.file}</Text>
              </Text>
            );
          })}
        </FieldBox>
      )}

      {showAgentName && (
        <FieldBox title="Agent Display Name" focused={focusZone === 'agentName'} height={3}>
          <TextInput
            placeholder="TypeScript Expert, API Designer…"
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
          { key: 'Space / Enter', label: 'Toggle / select' },
          { key: 'Tab', label: 'Switch focus zone' },
          { key: 'Ctrl+S', label: 'Continue' },
          { key: 'Esc', label: 'Back' },
        ]}
      />
    </Box>
  );
}
