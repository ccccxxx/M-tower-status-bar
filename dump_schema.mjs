import z from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const Schema = z.object({
  系统: z.object({
    当前楼层: z.string().default('第1层'),
    楼层编号: z.coerce.number().default(1),
    游戏阶段: z.string().default('探索'),
    难度: z.enum(['普通', '困难']).default('普通'),
    楼层已交互: z.boolean().default(false),
  }),
  玩家: z.object({
    LV: z.coerce.number().default(1),
    EXP: z.coerce.number().default(0),
    HP: z.coerce.number().default(100),
    MaxHP: z.coerce.number().default(100),
    MP: z.coerce.number().default(100),
    MaxMP: z.coerce.number().default(100),
    WIL: z.coerce.number().default(100),
    MaxWIL: z.coerce.number().default(100),
    ATK: z.coerce.number().default(10),
    curATK: z.coerce.number().default(10),
    DEF: z.coerce.number().default(10),
    curDEF: z.coerce.number().default(10),
    G: z.coerce.number().default(0),
    SP: z.coerce.number().default(0),
    天赋: z.record(z.string(), z.object({
      描述: z.string().default(''),
    })).default({}),
    职业: z.object({
      名称: z.string().default(''),
      阶位: z.coerce.number().default(1),
    }),
    主动技能: z.record(z.string(), z.object({
      描述: z.string().default(''),
      效果: z.string().default(''),
      消耗: z.record(z.string(), z.coerce.number()).default({}),
    })).default({}),
    被动技能: z.record(z.string(), z.object({
      描述: z.string().default(''),
    })).default({}),
    状态效果: z.object({
      增益: z.record(z.string(), z.object({
        剩余回合: z.coerce.number().default(1),
        描述: z.string().default(''),
      })).default({}),
      减益: z.record(z.string(), z.object({
        剩余回合: z.coerce.number().default(1),
        描述: z.string().default(''),
      })).default({}),
    }).default({增益: {}, 减益: {}}),
  }),
  装备: z.object({
    武器: z.preprocess(val => {
      if (typeof val === 'string') return val === '暂无' || val === '无' ? null : {名称: val, 属性: {}, 效果: ''};
      return val;
    }, z.object({名称: z.string(), 属性: z.record(z.string(), z.coerce.number()).default({}), 效果: z.string().default('')}).nullable()),
    防具: z.preprocess(val => {
      if (typeof val === 'string') return val === '暂无' || val === '无' ? null : {名称: val, 属性: {}, 效果: ''};
      return val;
    }, z.object({名称: z.string(), 属性: z.record(z.string(), z.coerce.number()).default({}), 效果: z.string().default('')}).nullable()),
    饰品: z.preprocess(val => {
      if (typeof val === 'string') return val === '暂无' || val === '无' ? null : {名称: val, 属性: {}, 效果: ''};
      return val;
    }, z.object({名称: z.string(), 属性: z.record(z.string(), z.coerce.number()).default({}), 效果: z.string().default('')}).nullable()),
  }),
  背包: z.record(z.string(), z.object({
    数量: z.coerce.number().default(1),
    描述: z.string().default(''),
    类型: z.enum(['武器','防具','饰品','消耗品','材料','道具','特殊道具']).default('道具'),
    属性: z.record(z.string(), z.coerce.number()).default({}),
    效果: z.string().default(''),
    持续回合: z.coerce.number().default(0),
  })).default({}),
  战斗: z.object({
    战斗中: z.boolean().default(false),
    回合数: z.coerce.number().default(0),
    敌人: z.record(z.string(), z.object({
      LV: z.coerce.number().default(0),
      HP: z.coerce.number().default(0),
      MaxHP: z.coerce.number().default(0),
      ATK: z.coerce.number().default(0),
      DEF: z.coerce.number().default(0),
      状态效果: z.object({
        增益: z.record(z.string(), z.object({
          剩余回合: z.coerce.number().default(1),
          描述: z.string().default(''),
        })).default({}),
        减益: z.record(z.string(), z.object({
          剩余回合: z.coerce.number().default(1),
          描述: z.string().default(''),
        })).default({}),
      }).default({增益: {}, 减益: {}}),
    })).default({}),
  }),
});

const json = JSON.stringify(z.toJSONSchema(Schema, { io: 'input', reused: 'ref' }), null, 2);

const targetDir = path.join(__dirname, 'src', 'M不复还');
fs.writeFileSync(path.join(targetDir, 'schema.json'), json, 'utf-8');
console.log('schema.json 已更新:', path.join(targetDir, 'schema.json'));
