import { Column, Connection, createConnection, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserInterface } from "@reactive-underground/users";
import { SqlUserRepository } from "./SqlUserRepository";
import { UserNotFoundException } from "../exception/UserNotFoundException";

describe("SqlUserRepository", () => {
    let connection: Connection;
    let repository: SqlUserRepository<User>;

    @Entity('users')
    class User implements UserInterface<number> {
        @PrimaryGeneratedColumn()
        id: number;

        @Column({
            unique: true
        })
        login: string;

        @Column()
        password: string;
    }

    beforeEach(async () => {
        connection = await createConnection({
            database: ":memory:",
            type: 'sqlite',
            entities: [User],
            synchronize: true,
            dropSchema: true,
        });
        repository = new SqlUserRepository<User>(
            connection.getRepository(User)
        );
    });

    afterEach(async () => {
        await connection.close();
    });

    describe("save", () => {
        it("should be save plain object", async () => {
            const user: UserInterface<number> = {
                password: "1234",
                login: 'test'
            };
            await repository.save(user);
            expect(user.id).toBeDefined();
        });
    })
    describe("update", () => {
        it("should be update", async () => {
            const users = await connection.getRepository(User).save([
                { login: '1234', password: '1234' }
            ]);
            users[0].login = "2222";
            await repository.update(users[0]);

            const updatedUser = await connection.getRepository(User).findOne(users[0].id);
            expect(updatedUser).toBeDefined();
            expect(updatedUser.id).toBe(users[0].id);
            expect(updatedUser.login).toBe(users[0].login);
            expect(updatedUser.password).toBe(users[0].password);
        });
    });
    describe("getById", () => {
        it("should be return exists entity", async () => {
            const users = await connection.getRepository(User).save([
                { login: "1234", password: '1234' }
            ]);
            const user = await repository.getById(users[0].id);
            expect(user).toBeDefined();
            expect(user).toEqual(users[0]);
        });
        it("should be throw UserNotFoundException", async () => {
            try {
                await repository.getById(1);
            } catch (e) {
                expect(e).toBeInstanceOf(UserNotFoundException);
            }
        });
    });
    describe("findByLogin", () => {
        let users: User[];
        beforeEach(async () => {
            users = await connection.getRepository(User).save([
                { login: "1234", password: '1234' }
            ]);
        });
        it("should be return user by login", async () => {
            const user = await repository.findByLogin('1234');
            expect(user).toBeDefined();
            expect(user).toEqual(users[0]);
        });
        it("should be return undefined", async () => {
            const user = await repository.findByLogin('12345');
            expect(user).toBeUndefined();
        });
    });
});
