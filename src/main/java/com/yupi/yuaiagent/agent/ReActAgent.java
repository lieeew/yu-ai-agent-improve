package com.yupi.yuaiagent.agent;

import cn.hutool.core.util.StrUtil;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;

/**
 * ReAct (Reasoning and Acting) 模式的代理抽象类
 * 实现了思考-行动的循环模式
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Slf4j
public abstract class ReActAgent extends BaseAgent {

    /** 前端解析：思考内容块 */
    public static final String YUAI_THINK_START = "<yuai_think>";
    public static final String YUAI_THINK_END = "</yuai_think>";
    /** 前端解析：工具行动结果块 */
    public static final String YUAI_ACT_START = "<yuai_act>";
    public static final String YUAI_ACT_END = "</yuai_act>";

    /**
     * 单步思考结果：模型思考文本 + 是否进入行动阶段
     */
    public interface ThinkStepOutcome {
        String thinking();

        boolean shouldAct();
    }

    /**
     * 处理当前状态并决定下一步行动
     *
     * @return 思考结论与是否执行 {@link #act()}
     */
    public abstract ThinkStepOutcome think();

    /**
     * 执行决定的行动
     *
     * @return 行动执行结果
     */
    public abstract String act();

    /**
     * 执行单个步骤：思考和行动
     *
     * @return 步骤执行结果
     */
    @Override
    public String step() {
        try {
            ThinkStepOutcome outcome = think();
            if (!outcome.shouldAct()) {
                String body = StrUtil.blankToDefault(outcome.thinking(), "（无文本）");
                return YUAI_THINK_START + body + YUAI_THINK_END + "\n思考完成 - 无需行动";
            }
            return act();
        } catch (Exception e) {
            // 记录异常日志
            e.printStackTrace();
            return "步骤执行失败：" + e.getMessage();
        }
    }

}
