export const Schema = z.object({
  世界: z
    .object({
      日期: z.string().prefault(''),
      星期: z.string().prefault(''),
      时间: z.string().prefault(''),
      地点: z.string().prefault(''),
      天气: z.string().prefault('晴'),
    })
    .prefault({}),
  角色: z
    .record(
      z.string(),
      z.object({
        在场: z.boolean().prefault(true),
        好感: z.coerce.number().transform(value => _.clamp(value, 0, 100)).prefault(0),
        关系阶段: z.string().prefault('陌生人'),
        衣着: z.string().prefault(''),
        外貌: z.string().prefault(''),
        事件: z.record(z.string(), z.boolean()).prefault({}),
      }),
    )
    .prefault({}),
  $flag: z.record(z.string(), z.boolean()).prefault({}),
});

export type Schema = z.output<typeof Schema>;
