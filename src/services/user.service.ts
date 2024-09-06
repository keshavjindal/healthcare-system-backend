import { AppDataSource } from "../data-source";
import { userRole } from "../enums/userRole.enum";
import { hashPassword } from "../utils/passwordHash";

export class UserService {
    private userRepository = AppDataSource.getRepository('users')

    async createUser(name: string, email: string, password: string, role: userRole) {
        if(await this.userRepository.findOneBy({ email })){
            throw new Error('User already exists')
        }

        const hashedPassword = await hashPassword(password)
        const user = this.userRepository.create({ name, email, password: hashedPassword, role })
        return await this.userRepository.save(user)
    }
}