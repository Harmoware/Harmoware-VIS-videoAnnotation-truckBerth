import React from 'react';

export const TruckBerthInput = (props)=>{
    const { actions, id, videoFps, realFrameInterval } = props;

    const onSelect = (e)=>{
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        actions.setLoading(true);
        props.updateState({truckBerthData:null,berthDataArray:null})
        actions.setMovesBase([]);
        reader.readAsText(file);
        const file_name = file.name;
        reader.onload = () => {
            const linedata = reader.result.toString().split(/\r\n/);
            const readdata = linedata.map((lineArray)=>{
                return lineArray.split(',')
            })
            const titledata = readdata.shift()
            const dataLength = titledata.length
            const filterData = readdata.filter((data)=>data.length===dataLength)
            const ngData = filterData.find((data,idx)=>parseInt(data[0])!==idx)
            if(ngData!==undefined){
                window.alert('CSVデータのフレーム数が不正');
                console.log('CSVデータのフレーム数が不正')
                return
            }
            const lastData = [...filterData[filterData.length-1]]
            lastData[0] = filterData.length
            filterData.push(lastData)
            let berthDataArray = new Array(dataLength-1);
            const truckBerthData = filterData.map((data,idx)=>{
                const frame = parseInt(data[0])
                let berthData = []
                let berthUseCount = 0
                let doorOpneCount = 0
                for(let i=0; i<data.length; i=i+1){
                    if(i>0){
                        const setData = parseInt(data[i]) 
                        berthData.push(setData)
                        if(idx===0){
                            berthDataArray[i-1] = []
                        }
                        berthDataArray[i-1].push(setData)
                        berthUseCount = berthUseCount + (setData>0 ? 1 : 0)
                        doorOpneCount = doorOpneCount + (setData===1 ? 1 : 0)
                    }
                }
                berthData.reverse()
                return {
                    frame:frame,
                    elapsedtime:(frame/videoFps),
                    realtime:(frame*realFrameInterval),
                    berthData:berthData,
                    berthUseRete:(berthUseCount/(data.length-1)),
                    doorOpenRete:(doorOpneCount/(data.length-1))
                }
            })
            berthDataArray.reverse()
            actions.setInputFilename({ truckBerthFileName: file_name });
            props.updateState({truckBerthData,berthDataArray})
            //actions.setMovesBase(readdata);
            actions.setAnimatePause(true);
            //actions.setTimeBegin(0)
            //actions.setTime(0)
            actions.setLoading(false);
        };
    };

    const onClick = (e)=>{
        actions.setInputFilename({ truckBerthFileName: null });
        props.updateState({truckBerthData:null,berthDataArray:null})
        actions.setMovesBase([]);
        e.target.value = '';
    };

    return (
        <input type="file" accept=".csv"
        id={id}
        onChange={onSelect}
        onClick={onClick}
        />
    );
}
