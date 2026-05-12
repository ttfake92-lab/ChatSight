import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill, Sequence } from "remotion";

const stages = [
  {
    phase: "第一阶段",
    title: "核心 MVP",
    subtitle: "快速验证产品核心价值",
    features: ["会话列表展示", "聊天记录查看", "AI 摘要生成"],
    color: "#3B82F6",
    icon: "🎯",
  },
  {
    phase: "第二阶段",
    title: "监控告警",
    subtitle: "实现实时监控能力",
    features: ["实时消息监控", "关键词告警", "桌面原生通知"],
    color: "#F59E0B",
    icon: "🔔",
  },
  {
    phase: "第三阶段",
    title: "数据分析",
    subtitle: "提供数据驱动决策支持",
    features: ["消息统计分析", "活跃度看板", "数据可视化"],
    color: "#10B981",
    icon: "📊",
  },
  {
    phase: "第四阶段",
    title: "高级功能",
    subtitle: "满足高阶用户定制化需求",
    features: ["全文搜索", "FAQ 提取", "Skill 系统"],
    color: "#8B5CF6",
    icon: "⚡",
  },
];

const StageCard: React.FC<{
  stage: typeof stages[0];
  index: number;
  startFrame: number;
  duration: number;
}> = ({ stage, index, startFrame, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;
  const cardWidth = 280;
  const spacing = 20;
  const totalWidth = cardWidth * 4 + spacing * 3;
  const startX = (1280 - totalWidth) / 2;
  const x = startX + index * (cardWidth + spacing);
  const y = 280;

  const cardAppear = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const cardY = interpolate(relativeFrame, [0, 20], [50, 0], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(relativeFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(relativeFrame, [0, 15], [0.8, 1], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (relativeFrame < 0 || relativeFrame > duration) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + cardY,
        width: cardWidth,
        height: 280,
        backgroundColor: "white",
        borderRadius: 16,
        boxShadow: `0 20px 40px rgba(0,0,0,0.15)`,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        overflow: "hidden",
        border: `3px solid ${stage.color}`,
      }}
    >
      <div
        style={{
          height: 8,
          backgroundColor: stage.color,
        }}
      />
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{stage.icon}</div>
        <div
          style={{
            fontSize: 12,
            color: stage.color,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {stage.phase}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1F2937",
            marginBottom: 4,
          }}
        >
          {stage.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6B7280",
            marginBottom: 16,
          }}
        >
          {stage.subtitle}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stage.features.map((feature, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "#4B5563",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: stage.color,
                }}
              />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Timeline: React.FC<{ visible: boolean }> = ({ visible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(frame, [25, 30], [0, visible ? 1 : 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 140,
        width: 1000,
        height: 4,
        backgroundColor: "#E5E7EB",
        borderRadius: 2,
        opacity,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: "#3B82F6",
          borderRadius: 2,
        }}
      />
      {stages.map((stage, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i / 3) * 100}%`,
            top: -8,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: progress >= i / 3 ? stage.color : "#E5E7EB",
            border: "3px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
      ))}
    </div>
  );
};

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const y = interpolate(frame, [0, 20], [-30, 0], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#6B7280",
          marginBottom: 12,
          letterSpacing: 2,
        }}
      >
        CHATSIGHT
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#1F2937",
          letterSpacing: -1,
        }}
      >
        产品发展路线图
      </div>
      <div
        style={{
          fontSize: 18,
          color: "#9CA3AF",
          marginTop: 8,
        }}
      >
        四个阶段 · 从 MVP 到高级功能
      </div>
    </div>
  );
};

const PhaseLabel: React.FC<{
  stage: typeof stages[0];
  index: number;
  startFrame: number;
  duration: number;
}> = ({ stage, index, startFrame, duration }) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const opacity = interpolate(relativeFrame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
  });

  const y = interpolate(relativeFrame, [5, 20], [20, 0], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (relativeFrame < 0 || relativeFrame > duration) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 150 + index * 5,
        left: 80 + index * 270,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: stage.color,
        }}
      >
        {stage.phase}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#6B7280",
        }}
      >
        {stage.title}
      </div>
    </div>
  );
};

const SummaryFooter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const y = interpolate(frame, [65, 80], [30, 0], {
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          marginBottom: 16,
        }}
      >
        {stages.map((stage, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: stage.color,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {stage.title}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#9CA3AF",
        }}
      >
        从核心功能到高级定制化的完整演进路径
      </div>
    </div>
  );
};

export const MyComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  const stageDuration = 45;
  const headerDuration = 20;
  const timelineStart = 25;
  const footerStart = 65;
  const totalDuration = footerStart + 40;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F9FAFB",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Sequence from={0} durationInFrames={totalDuration}>
        <Header />
        
        {stages.map((stage, index) => (
          <Sequence
            key={index}
            from={headerDuration + index * 5}
            durationInFrames={stageDuration}
          >
            <StageCard
              stage={stage}
              index={index}
              startFrame={0}
              duration={stageDuration}
            />
          </Sequence>
        ))}

        <Sequence from={timelineStart} durationInFrames={totalDuration - timelineStart}>
          <Timeline visible={true} />
        </Sequence>

        {stages.map((stage, index) => (
          <Sequence
            key={`label-${index}`}
            from={headerDuration + index * 5}
            durationInFrames={stageDuration}
          >
            <PhaseLabel
              stage={stage}
              index={index}
              startFrame={0}
              duration={stageDuration}
            />
          </Sequence>
        ))}

        <Sequence from={footerStart} durationInFrames={totalDuration - footerStart}>
          <SummaryFooter />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
