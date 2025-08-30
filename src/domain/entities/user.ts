export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}




  static create(email: string, name: string, id: string): UserEntity  {
    return new UserEntity(
      id,
      email,
      name,
      new Date(),
      new Date()
    );
  }

  updateName(newName: string): UserEntity {
    if (!newName.trim()) {
      throw new Error("Name cannot be empty");
    }
    return new UserEntity(
      this.id,
      this.email,
      newName,
      this.createdAt,
      new Date(),
    );
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
