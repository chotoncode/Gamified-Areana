import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Play, Send, Clock, AlertTriangle, ChevronRight,
  Code2, Terminal, Zap, Shield, CheckCircle2, XCircle,
  Eye, EyeOff, Copy, RotateCcw, Maximize2, Minimize2
} from 'lucide-react';

// Sample coding problems
const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    testCases: [
      { input: [2, 7, 11, 15], target: 9, expected: [0, 1] },
      { input: [3, 2, 4], target: 6, expected: [1, 2] },
      { input: [3, 3], target: 6, expected: [0, 1] },
    ],
    starterCode: {
      python: `def two_sum(nums, target):\n    # Your code here\n    pass\n`,
      javascript: `function twoSum(nums, target) {\n    // Your code here\n}\n`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};\n`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}\n`,
    },
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array **in-place** with O(1) extra memory.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: '' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: '' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's[i] is a printable ascii character'],
    testCases: [
      { input: ['h','e','l','l','o'], expected: ['o','l','l','e','h'] },
      { input: ['H','a','n','n','a','h'], expected: ['h','a','n','n','a','H'] },
    ],
    starterCode: {
      python: `def reverse_string(s):\n    # Your code here\n    pass\n`,
      javascript: `function reverseString(s) {\n    // Your code here\n}\n`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};\n`,
      java: `class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}\n`,
    },
  },
];

const LANGUAGES = [
  { id: 'python', label: 'Python', monacoId: 'python' },
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
  { id: 'cpp', label: 'C++', monacoId: 'cpp' },
  { id: 'java', label: 'Java', monacoId: 'java' },
];

/**
 * BattleRoom — The core coding arena with Monaco editor,
 * timer, problem statement, and real-time opponent status
 */
export default function BattleRoom() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emit, on, off } = useSocket();

  // Problem & state
  const [problem] = useState(() => PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showOutput, setShowOutput] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [matchActive, setMatchActive] = useState(true);

  // Opponent status
  const [opponentStatus, setOpponentStatus] = useState('coding'); // coding, testing, submitted
  const [opponentName] = useState('ByteSlayer');

  // Anti-cheat
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Panel sizes
  const [editorFullscreen, setEditorFullscreen] = useState(false);

  // Set initial code based on language
  useEffect(() => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem]);

  // Timer countdown
  useEffect(() => {
    if (!matchActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setMatchActive(false);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchActive]);

  // Anti-cheat: detect tab switching
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 3) {
            setShowWarning(true);
          }
          return next;
        });
      }
    };

    // Disable copy/paste in editor area
    const handleCopy = (e) => {
      // Allow copy in output area
      if (e.target.closest('.output-panel')) return;
    };

    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Simulate opponent activity
  useEffect(() => {
    const statuses = ['coding', 'coding', 'coding', 'testing', 'coding'];
    let i = 0;
    const interval = setInterval(() => {
      setOpponentStatus(statuses[i % statuses.length]);
      i++;
    }, 5000);

    // Simulate opponent submitting after some time
    const submitTimeout = setTimeout(() => {
      setOpponentStatus('submitted');
    }, Math.random() * 300000 + 180000); // 3-8 min

    return () => {
      clearInterval(interval);
      clearTimeout(submitTimeout);
    };
  }, []);

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * Run code against test cases (mock execution)
   */
  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput('Running test cases...\n');

    // Simulate code execution
    await new Promise(r => setTimeout(r, 1500));

    // Mock test results
    const results = problem.testCases.map((tc, i) => ({
      id: i + 1,
      passed: Math.random() > 0.3,
      input: JSON.stringify(tc.input),
      expected: JSON.stringify(tc.expected),
      actual: Math.random() > 0.3 ? JSON.stringify(tc.expected) : 'Error',
      time: `${(Math.random() * 50 + 5).toFixed(0)}ms`,
    }));

    setTestResults(results);
    const passed = results.filter(r => r.passed).length;
    setOutput(`Test Results: ${passed}/${results.length} passed\n\n` +
      results.map(r =>
        `Test ${r.id}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}\n  Input: ${r.input}\n  Expected: ${r.expected}${!r.passed ? `\n  Got: ${r.actual}` : ''}\n  Time: ${r.time}`
      ).join('\n\n')
    );

    setIsRunning(false);
  };

  /**
   * Submit final solution
   */
  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm('Submit your solution? This is final.')) return;

    setIsSubmitting(true);
    setShowOutput(true);
    setOutput('Submitting solution...\nRunning all test cases...\n');

    await new Promise(r => setTimeout(r, 2000));

    // Mock submission: all tests pass
    const allPassed = Math.random() > 0.3;
    const results = problem.testCases.map((tc, i) => ({
      id: i + 1,
      passed: allPassed || Math.random() > 0.4,
      time: `${(Math.random() * 50 + 5).toFixed(0)}ms`,
    }));

    const passed = results.filter(r => r.passed).length;
    setOutput(
      `📋 SUBMISSION RESULTS\n${'═'.repeat(30)}\n\n` +
      `Tests Passed: ${passed}/${results.length}\n` +
      `Time Used: ${formatTime(15 * 60 - timeLeft)}\n\n` +
      results.map(r => `  Test ${r.id}: ${r.passed ? '✅' : '❌'} (${r.time})`).join('\n') +
      `\n\n${passed === results.length ? '🏆 ALL TESTS PASSED!' : '⚠️ Some tests failed.'}`
    );

    setMatchActive(false);
    setIsSubmitting(false);

    // Navigate to results after delay
    setTimeout(() => {
      navigate(`/results/${matchId}`);
    }, 3000);
  };

  // Timer urgency color
  const timerColor = timeLeft > 300 ? 'text-arena-accent' : timeLeft > 60 ? 'text-arena-warning' : 'text-arena-danger';
  const timerBg = timeLeft > 300 ? 'border-arena-accent/30' : timeLeft > 60 ? 'border-arena-warning/30' : 'border-arena-danger/30 animate-pulse';

  return (
    <div className="h-screen flex flex-col bg-arena-bg overflow-hidden">
      {/* === Top Bar === */}
      <div className="flex items-center justify-between px-4 py-2 bg-arena-surface border-b border-arena-border">
        {/* Left: Problem Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-arena-accent" />
            <span className="font-display font-bold text-white text-sm hidden sm:block">CODEARENA</span>
          </div>
          <div className="w-px h-6 bg-arena-border" />
          <div>
            <span className="text-white text-sm font-medium">{problem.title}</span>
            <span className={`ml-2 text-xs px-2 py-0.5 border ${
              problem.difficulty === 'Easy' ? 'text-arena-success border-arena-success/30' :
              problem.difficulty === 'Medium' ? 'text-arena-warning border-arena-warning/30' :
              'text-arena-danger border-arena-danger/30'
            }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Center: Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 border ${timerBg}`}>
          <Clock className={`w-4 h-4 ${timerColor}`} />
          <span className={`font-mono font-bold text-lg ${timerColor}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Right: Opponent Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-arena-card border border-arena-border">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${opponentName}`}
              alt="opponent"
              className="w-6 h-6"
            />
            <span className="text-xs text-arena-muted">{opponentName}</span>
            <div className="flex items-center gap-1">
              {opponentStatus === 'coding' && (
                <div className="flex gap-0.5">
                  <span className="typing-dot w-1.5 h-1.5 bg-arena-accent rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-arena-accent rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-arena-accent rounded-full" />
                </div>
              )}
              {opponentStatus === 'testing' && (
                <span className="text-xs text-arena-warning font-mono">TESTING</span>
              )}
              {opponentStatus === 'submitted' && (
                <span className="text-xs text-arena-success font-mono">DONE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Anti-cheat Warning === */}
      <AnimatePresence>
        {tabSwitches > 0 && tabSwitches < 3 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-arena-warning/10 border-b border-arena-warning/30 px-4 py-2 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-arena-warning" />
            <span className="text-xs text-arena-warning">
              Tab switch detected ({tabSwitches}/3). Further tab switching may disqualify you.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Main Content: Problem + Editor === */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Problem Panel */}
        {!editorFullscreen && (
          <div className="lg:w-[40%] border-b lg:border-b-0 lg:border-r border-arena-border overflow-y-auto max-h-[30vh] lg:max-h-full">
            <div className="p-4 sm:p-6">
              <h2 className="font-display font-bold text-xl text-white mb-4">{problem.title}</h2>

              {/* Description */}
              <div className="text-sm text-arena-text leading-relaxed whitespace-pre-line mb-6">
                {problem.description}
              </div>

              {/* Examples */}
              <div className="space-y-4 mb-6">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="bg-arena-bg border border-arena-border p-4">
                    <div className="text-xs text-arena-muted uppercase tracking-wider mb-2">
                      Example {i + 1}
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div><span className="text-arena-muted">Input:</span> <span className="text-arena-accent">{ex.input}</span></div>
                      <div><span className="text-arena-muted">Output:</span> <span className="text-arena-success">{ex.output}</span></div>
                      {ex.explanation && (
                        <div><span className="text-arena-muted">Explanation:</span> <span className="text-arena-text">{ex.explanation}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <div className="text-xs text-arena-muted uppercase tracking-wider mb-2">Constraints</div>
                <ul className="text-sm text-arena-text space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-arena-accent mt-1">•</span>
                      <span className="font-mono text-xs">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-arena-surface border-b border-arena-border">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-arena-accent" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-arena-card border border-arena-border text-white text-xs px-2 py-1 focus:outline-none focus:border-arena-accent"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(problem.starterCode[language] || '')}
                className="p-1.5 text-arena-muted hover:text-white transition-colors"
                title="Reset code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditorFullscreen(!editorFullscreen)}
                className="p-1.5 text-arena-muted hover:text-white transition-colors"
                title={editorFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {editorFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.id === language)?.monacoId || 'python'}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Output Panel */}
          <AnimatePresence>
            {showOutput && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 200 }}
                exit={{ height: 0 }}
                className="border-t border-arena-border bg-arena-bg overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-arena-border">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-arena-accent" />
                    <span className="text-xs text-arena-muted uppercase tracking-wider">Output</span>
                  </div>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-arena-muted hover:text-white"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
                <pre className="output-panel p-4 text-xs font-mono text-arena-text overflow-y-auto h-[calc(100%-36px)] whitespace-pre-wrap">
                  {output}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-arena-surface border-t border-arena-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOutput(!showOutput)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-arena-muted border border-arena-border hover:text-white hover:border-arena-accent/50 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Console
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={isRunning || !matchActive}
                className="btn-neon text-sm flex items-center gap-2 py-2 disabled:opacity-50"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-arena-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !matchActive}
                className="btn-solid text-sm flex items-center gap-2 py-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-arena-bg border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
