import { Identifier } from '../../shared/Identifier';

export class TeamId extends Identifier {
  public static create(id?: string): TeamId {
    return new TeamId(id);
  }
}
