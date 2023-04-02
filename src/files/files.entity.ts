import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../posts/post.entity';

@Entity()
export class FilesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    url: string;

    @OneToOne(() => PostEntity, (post) => post.file)
    @JoinColumn()
    post: PostEntity;
}
