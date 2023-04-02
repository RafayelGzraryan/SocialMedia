import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FilesEntity } from '../files/files.entity';

@Entity()
export class PostEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    text: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ required: false })
    @Column({ nullable: true })
    imageKey: string;

    @ApiProperty()
    @Column({ default: false })
    published: boolean;

    @ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: 'CASCADE' })
    user: UserEntity;

    @OneToOne(() => FilesEntity, (file) => file.post)
    file: FilesEntity;
}
