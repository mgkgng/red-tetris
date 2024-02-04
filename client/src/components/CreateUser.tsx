const CreateUser = ({ socket }) => {

    return (
        <div>
            <h1>Create User</h1>
            <form>
                <label htmlFor="username">Username</label>
                <input type="text" name="username" id="username" />
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" />
                <button type="submit">Create User</button>
            </form>
        </div>
    )
}
