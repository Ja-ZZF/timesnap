import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collect } from './entities/collect.entity';

@Injectable()
export class CollectService {
  constructor(
    @InjectRepository(Collect)
    private readonly collectRepo: Repository<Collect>,
  ) {}

  create(collect: Partial<Collect>) {
    return this.collectRepo.save(collect);
  }

  findAll() {
    return this.collectRepo.find();
  }

  findByUser(user_id: number) {
    return this.collectRepo.find({ where: { user_id } });
  }

  remove(id: number) {
    return this.collectRepo.delete(id);
  }
}
