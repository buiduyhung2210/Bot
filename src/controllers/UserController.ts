
import User from "../db/models/user";

const CreateUser = async (req: any) => {
	try {
		console.log(req)
		const create = await User.create({
			Name: req.Name,
			teleId: req.teleId,
		});
		console.log(req)

	} catch (error: any) {
		console.log(error)
	}
}


export default { CreateUser };