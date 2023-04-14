import { inject, injectable } from "tsyringe";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferStatementError } from "./TransferStatementError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ITransferStatementDTO } from "./ITransferStatementDTO";
import { Statement } from "../../entities/Statement";

@injectable()
class TransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository) { }

  async execute({ amount, description, type, receiver_id, sender_id }: ITransferStatementDTO): Promise<Statement> {
    const user_sender = await this.usersRepository.findById(sender_id);
    const user_receiver = await this.usersRepository.findById(receiver_id);

    if (!user_sender) {
      throw new TransferStatementError.UserNotFound();
    }

    if (!user_receiver) {
      throw new TransferStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id as string });

    if (amount < balance) {
      throw new TransferStatementError.InsufficientFunds()
    }

    const statementTransferSender = await this.statementsRepository.create({
      user_id: sender_id,
      type,
      amount,
      description,
      sender_id
    });

    return statementTransferSender;

  }
}

export { TransferStatementUseCase }