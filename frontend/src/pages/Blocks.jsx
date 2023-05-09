import {useEffect, useState} from "react";
import {publicRequest} from "../requestMethods";
import BLock from "../components/BLock";
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";

const Blocks = () => {

    const [blocks, setBlocks] = useState([])
    const [id, setId] = useState(1)
    const [blocksLength, setBlocksLength] = useState(1)

    useEffect(() => {
        fetchBlocksLength()
        fetchPaginatedBlocks(id)
    }, [])

    const fetchBlocksLength = async () => {
        try{
            const res = await publicRequest.get(`/blocks/length`)
            setBlocksLength(res.data)
        }catch (e) {
            console.log(e)
        }
    }

    const fetchPaginatedBlocks = async (paginatedId) => {
        try{
            const res = await publicRequest.get(`/blocks/${paginatedId}`)
            setBlocks(res.data)
        }catch (e) {
            console.log(e)
        }
    }

    return(
        <div>
            <div><Link to={'/'}>Home</Link></div>
            <div><Link to={'/conduct-transaction'}>Conduct Transaction</Link></div>
            <hr/>
            <h3>Blocks</h3>
            <div>
                {
                    [...Array(Math.ceil(blocksLength / 5)).keys()].map(key => {
                        const paginatedId = key +1

                        return(
                            <span key={key}>
                                <Button size={'sm'}
                                        variant="danger"
                                        onClick={() => fetchPaginatedBlocks(paginatedId)}
                                >
                                    {paginatedId}
                                </Button>{' '}
                            </span>
                        )
                    })
                }
            </div>
            {
                blocks.map((block, index) => {
                    return(
                        <div key={block.hash}>
                            <div  className={'Block'}>{block.hash}</div>
                            <BLock  block={block}/>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Blocks