export const Schema = z.object({
  系统: z.object({
    当前楼层: z.string().prefault('第1层'),
    楼层编号: z.coerce.number().prefault(1),
    游戏阶段: z.string().prefault('探索'),
    难度: z.enum(['普通', '困难']).prefault('普通'),
  }),
  玩家: z.object({
    LV: z.coerce.number().prefault(1),
    EXP: z.coerce.number().prefault(0),
    HP: z.coerce.number().prefault(100),
    MaxHP: z.coerce.number().prefault(100),
    MP: z.coerce.number().prefault(100),
    MaxMP: z.coerce.number().prefault(100),
    WIL: z.coerce.number().prefault(100),
    MaxWIL: z.coerce.number().prefault(100),
    ATK: z.coerce.number().prefault(10),
    ATK公式: z.string().prefault('10'),
    DEF: z.coerce.number().prefault(10),
    DEF公式: z.string().prefault('10'),
    G: z.coerce.number().prefault(0),
    SP: z.coerce.number().prefault(0),
    天赋: z.record(z.string(), z.object({
      描述: z.string().prefault(''),
    })).prefault({}),
    职业: z.object({
      名称: z.string().prefault(''),
      阶位: z.coerce.number().prefault(1),
    }),
    主动技能: z.record(z.string(), z.object({
      描述: z.string().prefault(''),
      效果: z.string().prefault(''),
      消耗: z.record(z.string(), z.coerce.number()).prefault({}),
    })).prefault({}),
    被动技能: z.record(z.string(), z.object({
      描述: z.string().prefault(''),
    })).prefault({}),
    状态效果: z.object({
      增益: z.record(z.string(), z.object({
        剩余回合: z.coerce.number().prefault(1),
        描述: z.string().prefault(''),
      })).prefault({}),
      减益: z.record(z.string(), z.object({
        剩余回合: z.coerce.number().prefault(1),
        描述: z.string().prefault(''),
      })).prefault({}),
    }).prefault({增益: {}, 减益: {}}),
  }),
  装备: z.object({
    武器: z.string().prefault('暂无'),
    防具: z.string().prefault('暂无'),
    饰品: z.string().prefault('暂无'),
  }),
  背包: z.record(z.string(), z.object({
    数量: z.coerce.number().prefault(1),
    描述: z.string().prefault(''),
  })).prefault({}),
  战斗: z.object({
    战斗中: z.boolean().prefault(false),
    回合数: z.coerce.number().prefault(0),
    敌人: z.record(z.string(), z.object({
      LV: z.coerce.number().prefault(0),
      HP: z.coerce.number().prefault(0),
      MaxHP: z.coerce.number().prefault(0),
      ATK: z.coerce.number().prefault(0),
      DEF: z.coerce.number().prefault(0),
      状态效果: z.object({
        增益: z.record(z.string(), z.object({
          剩余回合: z.coerce.number().prefault(1),
          描述: z.string().prefault(''),
        })).prefault({}),
        减益: z.record(z.string(), z.object({
          剩余回合: z.coerce.number().prefault(1),
          描述: z.string().prefault(''),
        })).prefault({}),
      }).prefault({增益: {}, 减益: {}}),
    })).prefault({}),
  }),
});

export type Schema = z.output<typeof Schema>;
