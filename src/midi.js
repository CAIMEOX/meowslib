class MidiPlayer{
    constructor(callback){
        this.JZZ=require('jzz');
        this.input=JZZ().openMidiIn();
        this.delay=JZZ.Widget({_receive:(msg)=>{
            if(msg['2']!=0&&msg['0']!=254){
                var sound=Math.pow(2,((msg['1']-54)/12));
                callback(sound);
            }
        }});
    }
    start(){
        this.input.connect(this.delay);
    }
    stop(){
        this.input.disconnect(this.delay);
    }
}
module.exports=MidiPlayer; 
