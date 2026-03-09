// Lesson content for each module.
// Each lesson has a title, instruction, and the text to type.
// Text is kept short enough to complete in one focused session.

export const LESSONS = {
  foundation: [
    {
      title: "Left Hand Anchor",
      instruction: "Keep your fingers on A S D F. Do not look at the keyboard.",
      text: "aaa sss ddd fff asd fds asdf fdsa add sad dad fad",
    },
    {
      title: "Right Hand Anchor",
      instruction: "Keep your fingers on J K L ;. Return to home row after every key.",
      text: "jjj kkk lll ;;; jkl ;lk jkl; ;lkj jak lak fall",
    },
    {
      title: "Full Home Row",
      instruction: "All eight fingers on the home row. Keep your wrists off the desk.",
      text: "asdf jkl; asdf jkl; asdfjkl; ;lkjfdsa ask all fall shall",
    },
    {
      title: "Home Row Words",
      instruction: "Real words using only home row keys. Accuracy before speed.",
      text: "add all ask fall flat glad hall lads lass flask salad",
    },
    {
      title: "Home Row Sentences",
      instruction: "Full sentences. Zero errors before you increase speed.",
      text: "a sad lad; a glad lass; ask a dad; shall all fall fast",
    },
    {
      title: "Speed Drill",
      instruction: "Same keys, faster. Only push speed if accuracy stays above 95%.",
      text: "asdf jkl; asdf jkl; fall all glad ask flask salad dad",
    },
    {
      title: "Endurance",
      instruction: "Longer run. Maintain your pace — no rushing, no stopping.",
      text: "all shall fall; a lad asks a lass; add a flask; glad dads; salads fall flat",
    },
    {
      title: "Home Row Mastery",
      instruction: "Final home row test. No looking. Hands stay on home row throughout.",
      text: "asdfjkl; add all sad fall flask glass lad lass ask glad dad shall salad flat",
    },
  ],

  fingers: [
    {
      title: "Left Pinky & Ring",
      instruction: "Q A Z with your pinky. W S X with your ring finger. Slow is smooth.",
      text: "qqq aaa zzz www sss xxx qaz wsx qa zw as xs qwas",
    },
    {
      title: "Right Pinky & Ring",
      instruction: "P ; / with your pinky. O L . with your ring finger.",
      text: "ppp ;;; /// ooo lll ... p; o. l; po l. ;p .o lo;",
    },
    {
      title: "Index Fingers",
      instruction: "Left index owns F G. Right index owns J H. Each key, return to home.",
      text: "fff ggg jjj hhh fg jh gf hj fgh jhg fghj jhgf fog jog",
    },
    {
      title: "Top Row Reach",
      instruction: "Reach up from home row. Finger goes up and returns immediately.",
      text: "eee rrr uuu iii er ui re iu eru iur true ruin tire",
    },
    {
      title: "Bottom Row Reach",
      instruction: "Reach down from home row. Return after every keystroke.",
      text: "ccc vvv mmm nnn cv mn vc nm cvm nmv cave name vine",
    },
    {
      title: "All Rows",
      instruction: "Full keyboard. Each finger owns its territory.",
      text: "the quick fox jump over; type with care; return to home",
    },
  ],

  accuracy: [
    {
      title: "Zero Errors",
      instruction: "Type this perfectly. If you make an error, restart mentally — don't rush to catch up.",
      text: "slow and steady wins the race; precision builds speed over time",
    },
    {
      title: "Problem Keys — Z X Q",
      instruction: "These are the least-used keys. Drill them until they feel natural.",
      text: "quiz quartz zinc zap fox box wax exact hex vex oxen zinc",
    },
    {
      title: "Punctuation Drill",
      instruction: "Punctuation slows most typists down. Treat each mark like any other key.",
      text: "hello, world. how are you? i'm fine; thanks! let's go: now.",
    },
    {
      title: "Number Row",
      instruction: "Reach up to the number row and return to home. No looking.",
      text: "123 456 789 0 12 34 56 78 90 1234 5678 90 1290 3456",
    },
    {
      title: "Accuracy Under Pressure",
      instruction: "Type quickly but never sacrifice accuracy. Stop, breathe, continue.",
      text: "the accuracy clinic exists because speed built on errors is fragile",
    },
  ],

  frequency: [
    {
      title: "Top 25 Words",
      instruction: "These 25 words appear constantly. Drill them to reflex.",
      text: "the of and a to in is it that he was for on are as with his they at be",
    },
    {
      title: "Top 26–50 Words",
      instruction: "Next tier of high-frequency words. Same goal — automatic recall.",
      text: "from or an but what all were when we there can an your which their said",
    },
    {
      title: "Top 100 in Sentences",
      instruction: "Common words in natural flow. This is how they actually appear.",
      text: "they said that all of them were there when it happened to the people",
    },
    {
      title: "Top 500 — Varied",
      instruction: "Broader vocabulary. Stay relaxed and let the words flow.",
      text: "great power comes with serious responsibility toward every living person",
    },
    {
      title: "Top 1000 — Real Writing",
      instruction: "Approaching 85% of everyday text. This is practical typing speed.",
      text: "the decision was difficult but necessary given the available information",
    },
  ],

  speed: [
    {
      title: "Baseline Test",
      instruction: "Type naturally. This establishes your current WPM before laddering.",
      text: "the quick brown fox jumps over the lazy dog near the river bank",
    },
    {
      title: "Burst Drill",
      instruction: "Short, fast bursts. Push slightly beyond comfortable pace for 10 seconds.",
      text: "fast fast fast type fast return home type fast stay accurate",
    },
    {
      title: "Stabilise",
      instruction: "Match your last burst speed over the full paragraph. Hold it steady.",
      text: "consistency at your target speed matters more than occasional peak speed",
    },
    {
      title: "+5 WPM Climb",
      instruction: "Deliberately faster than comfortable. Only climb when the previous rung is solid.",
      text: "the next level is always one focused session away from where you are now",
    },
  ],

  weakness: [
    {
      title: "Weakness Session",
      instruction: "Your slowest keys, targeted. Repeat until these feel like home row.",
      text: "practice makes permanent; drill your weak keys until they are automatic",
    },
  ],

  stamina: [
    {
      title: "5-Minute Flow",
      instruction: "Type continuously for the full passage. Maintain speed — don't degrade.",
      text: "endurance is built one session at a time; the typist who types long passages without slowing down has trained their fingers and mind to work as one unit across extended periods of sustained effort",
    },
    {
      title: "Quote Mode",
      instruction: "Real prose from literature. Every word is different — stay adaptable.",
      text: "it was the best of times it was the worst of times it was the age of wisdom it was the age of foolishness",
    },
    {
      title: "Code Mode",
      instruction: "Technical content with special characters. Essential for developers.",
      text: "const result = array.filter(item => item.active).map(item => item.value);",
    },
  ],

  ergonomics: [
    {
      title: "Posture Check",
      instruction: "Before typing: sit tall, shoulders relaxed, elbows at 90°, wrists elevated.",
      text: "good posture is the foundation of fast and painless typing over a lifetime",
    },
    {
      title: "Wrist Position",
      instruction: "Wrists must not rest on the desk while typing — only between bursts.",
      text: "float your wrists above the keyboard and feel the difference in finger mobility",
    },
    {
      title: "Break Cadence",
      instruction: "After this lesson, take a 5-minute break. You've earned it.",
      text: "thirty minutes of focused practice followed by five minutes of rest is the optimal cycle",
    },
    {
      title: "Sustainable Pace",
      instruction: "Type at a pace you could maintain for an hour. Relaxed and controlled.",
      text: "the fastest typists are also the most relaxed; tension is the enemy of speed",
    },
  ],
}
