
const Transaction = ({ transaction }) => {

    const { input, outputMap } = transaction
    const  recipients  = Object.keys(outputMap)

    console.log(recipients)


    return(
        <div>
            <div>From: { input.address.substring(0, 20) }... |  Balance: { input.amount }
                {
                    recipients.map((recipient, index) => {
                        return (
                            <div key={index}>
                                To : { recipient.substring(0, 20) }...  |  Sent: {outputMap[recipient]}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Transaction