import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  password_hash: string;

  @Column()
  last_name: string;

  @Column()
  first_name: string;

  @Column()
  email: string;
}
