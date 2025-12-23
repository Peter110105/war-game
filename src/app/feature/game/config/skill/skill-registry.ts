import { Skill } from '../../model/skill.model';
import { PASSIVE_SKILLS } from './passive-skills.config';
import { ACTIVE_SKILLS } from './active-skills.config';

/**
 * 技能註冊表 - 統一管理所有技能
 */
export const SKILL_REGISTRY: Record<string, Skill> = {
  ...PASSIVE_SKILLS,
  ...ACTIVE_SKILLS,
};

/**
 * 根據 ID 獲取技能（深拷貝）
 * @param skillId 技能 ID
 * @returns 技能 或 undefined
 */
export function getSkillById(skillId: string): Skill | undefined {
  const skill = SKILL_REGISTRY[skillId];
  if (!skill) {
    console.warn(`Skill not found: ${skillId}`);
    return undefined;
  }
  // 深拷貝避免共享引用
  return JSON.parse(JSON.stringify(skill));
}

/**
 * 批量獲取技能
 * @param skillIds 技能 ID 陣列
 * @returns 技能陣列
 */
export function getSkillsByIds(skillIds: string[]): Skill[] {
  return skillIds
    .map((id) => getSkillById(id))
    .filter((skill): skill is Skill => skill !== undefined);
}

/**
 * 獲取所有被動技能
 * @returns 被動技能陣列
 */
export function getAllPassiveSkills(): Skill[] {
  return Object.values(PASSIVE_SKILLS).map((skill) =>
    JSON.parse(JSON.stringify(skill))
  );
}

/**
 * 獲取所有主動技能
 * @returns 主動技能陣列
 */
export function getAllActiveSkills(): Skill[] {
  return Object.values(ACTIVE_SKILLS).map((skill) =>
    JSON.parse(JSON.stringify(skill))
  );
}
