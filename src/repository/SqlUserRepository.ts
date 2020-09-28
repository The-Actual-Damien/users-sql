import { FindUserOptionsInterface, UserInterface, UserRepositoryInterface } from "@reactive-underground/users";
import { Repository } from "typeorm"
import { UserNotFoundException } from "../exception/UserNotFoundException";

export class SqlUserRepository<Entity, ID = number> implements UserRepositoryInterface<ID> {
    constructor(
        private readonly repository: Repository<Entity>
    ) {}

    public async findBy<T>(options: FindUserOptionsInterface): Promise<T[]> {
        return Promise.resolve([] as T[]) ;
    }

    public async findByLogin<T>(login: string): Promise<T | undefined> {
        return await this.repository.findOne({
            where: {
                login
            }
        }) as unknown as T
    }

    public async getById<T>(id: ID): Promise<T> {
        const found = await this.repository.findOne(id);
        if(!found) {
            throw new UserNotFoundException();
        }
        return found as unknown as T;
    }

    public async remove(user: UserInterface<ID>): Promise<void> {
        await this.repository.remove(user as never);
    }

    public async save(user: UserInterface<ID>): Promise<void> {
        await this.repository.save(user as never);
    }

    public async update(user: UserInterface<ID>): Promise<void> {
        await this.repository.save(user as never);
    }
}
