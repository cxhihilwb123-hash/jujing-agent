import { useState } from 'react'

type IntroCopy = {
  headline: string
  body: string
}

export type IntroProps = {
  personality?: string
  seed?: number
}

const FALLBACK_COPY: IntroCopy[] = [
  {
    headline: '巨鲸智能体已就绪',
    body: '经营决策、客户线索、账号运营、内容创作、资料整理和流程执行，都可以交给我协同推进。'
  },
  {
    headline: '今天要处理什么？',
    body: '把业务目标告诉我，我可以拆解问题、寻找机会、规划动作，并持续推进到可落地的结果。'
  },
  {
    headline: '从哪里开始？',
    body: '从获客方案、销售跟进、私域运营到内容发布，复杂工作可以从一句话开始。'
  },
  {
    headline: '巨鲸智能体在线',
    body: '我可以帮助企业发现问题、制定策略、运营账号、沉淀客户，并把任务一步步执行下去。'
  },
  {
    headline: '需要我看什么？',
    body: '不只是回答问题，也能围绕增长、运营、销售和管理场景，帮你形成可用的业务成果。'
  }
]

function pickCopy(copies: IntroCopy[], seed = 0): IntroCopy {
  return copies[Math.abs(seed) % copies.length] || FALLBACK_COPY[0]
}

const WORDMARK = '巨鲸智能体'
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

function resolveCopy(personality?: string, seed?: number): IntroCopy {
  void personality
  return pickCopy(FALLBACK_COPY, seed)
}

export function Intro({ personality, seed }: IntroProps) {
  const [mountSeed] = useState(() => Math.floor(Math.random() * 100000))
  const copy = resolveCopy(personality, mountSeed + (seed ?? 0))

  return (
    <div
      className="pointer-events-none flex w-full min-w-0 flex-col items-center justify-center px-0.5 py-6 text-center text-muted-foreground sm:px-6 lg:px-8"
      data-slot="aui_intro"
    >
      <div className="flex w-full min-w-0 flex-col items-center">
        <div
          aria-label={WORDMARK}
          className="flex max-w-[calc(100%-2rem)] items-center gap-4 rounded-[28px] px-5 py-4 shadow-[0_22px_60px_rgba(0,38,90,0.18)]"
          style={{
            background:
              'linear-gradient(135deg, rgba(13,23,38,0.98) 0%, rgba(14,31,55,0.98) 52%, rgba(0,83,253,0.9) 160%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.08), 0 22px 60px rgba(0,38,90,0.18)'
          }}
        >
          <img
            alt=""
            className="size-[4.25rem] rounded-[20px] shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
            src={assetPath('jujing-icon.png')}
          />

          <h1
            className="m-0 whitespace-nowrap text-[2.75rem] leading-none font-[500] text-white sm:text-[3.05rem]"
            style={{
              fontFamily:
                '"Lantinghei SC", "FZLTXHK", "FZLTXHB", "Hiragino Sans GB", "PingFang SC", "Microsoft YaHei", var(--font-sans)',
              textShadow: '0 1px 0 rgba(255,255,255,0.16), 0 10px 28px rgba(0,0,0,0.28)'
            }}
          >
            {WORDMARK}
          </h1>
        </div>

        <p className="mt-5 mb-0 max-w-[42rem] text-center text-[0.96rem] leading-6 text-(--ui-text-secondary)">
          {copy.body}
        </p>
      </div>
    </div>
  )
}
