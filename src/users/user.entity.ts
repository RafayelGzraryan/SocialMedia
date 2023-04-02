import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../common/enums/users.role';
import { PostEntity } from '../posts/post.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class UserEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    email: string;

    @ApiProperty()
    @Column()
    password: string;

    @ApiProperty()
    @Column()
    role: Role;

    @OneToMany(() => PostEntity, (post) => post.user)
    posts: PostEntity[];
}
