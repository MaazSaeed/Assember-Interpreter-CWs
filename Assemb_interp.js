function assemblerInterpreter(program) 
{  
  // ******* PRE-PROCESSING *********
  let instructions = [];
  let interpretedProgram = "";
    
  for(let i = 0; i < program.length; i++)
  {
    let temp = "";
    if(program[i] == ";" && i < program.length) while(program[i] != '\n') i++;
    else 
    {
      while(program[i] != '\n' && i < program.length)
      {
        if(program[i] == ";" && i < program.length) while(program[i] != '\n' && i < program.length) i++;
        else
        {
          if(program[i] != ";" || program[i] != '\n')
            temp += program[i];
          i++;
        }
      }
    }
    temp != "" ? instructions.push(temp.trim()) : 0;  
  }
  
  for(let k = 0; k < instructions.length; k++)
  {
    if(instructions[k].substring(0, 3) == 'msg')
      continue;
    else
    {
      let ind = instructions[k].indexOf(",");
      instructions[k] = instructions[k].substring(0, ind) + instructions[k].substring(ind + 1, instructions[k].length);
    }
  }
     
  let current_command = instructions[0];
  let functions = {};
  
  let fptr = instructions.indexOf("end");
  instructions.push("f");
  for(let c = fptr + 1; c < instructions.length; c++)
  {
    let k = instructions[c];
    if(k[k.length - 1] == ":")
    {
      let inst = [];
      c++;
      let len = instructions[c].length;
      while(c < instructions.length && instructions[c] != "ret" && instructions[c].split('')[instructions[c].length - 1] != ":" && c < instructions.length)
      {
        inst.push(instructions[c]);
        c++;
      }
      if(c < instructions.length && instructions[c].split('')[instructions[c].length - 1] == ":")
        c--;
      
      k = k.split("");
      k.pop();
      k = k.join('');
      
      if(instructions[c] == "ret")
        inst.push("ret");
      if(c == instructions.length - 1)
        inst.push("f");
      
      functions[k] = inst;
    }
  }
  
  instructions = instructions.slice(0, instructions.indexOf("end") + 1);
  
  // *********** PROCESSING ********** 
  let mp = 0;
  let frames = []; 
  let stringMode = false;
  let registers = {};
  
  let func = false;
  let jump = false;
  let condition = "";

  let current = undefined;
  let pc = 0;
  let st = [];
  
  for(;mp < instructions.length;)
  {
    let cmd;
    
    if(current == undefined)
      cmd = instructions[mp];
    else if(current != undefined)
      cmd = functions[current][pc];
    
    console.log(cmd);
    let p = cmd.substring(0, cmd.length);
    cmd = cmd.split(" ");
    cmd = cmd.filter(i=> i != '');
    
    let cnd = "";
    if(cmd[0] == "cmp")
    {
      let procs = functions[current][pc + 1];
      let xy = functions[current][pc + 1];
      xy = xy.split(" ");
      cnd = xy[0];
    }
    
    switch(cmd[0])
    {
        case 'mov' : registers[cmd[1]] = cmd[2] >= 'a' && cmd[2] <= 'z' ? registers[cmd[2]] : +cmd[2];break;
        case 'inc' : registers[cmd[1]] += 1; break;
        case 'dec' : registers[cmd[1]] -= 1; break;
        case 'add' : registers[cmd[1]] += cmd[2] >= 'a' && cmd[2] <= 'z' ? registers[cmd[2]] : +cmd[2]; break;
        case 'sub' : registers[cmd[1]] -= cmd[2] >= 'a' && cmd[2] <= 'z' ? registers[cmd[2]] : +cmd[2]; break;
        case 'mul' : registers[cmd[1]] *= cmd[2] >= 'a' && cmd[2] <= 'z' ? registers[cmd[2]] : +cmd[2]; break;
        case 'div' : registers[cmd[1]] /= cmd[2] >= 'a' && cmd[2] <= 'z' ? registers[cmd[2]] : +cmd[2]; registers[cmd[1]] = registers[cmd[1]] | 0; break;
        case 'jmp' : current = cmd[1]; pc = -1; break;
        case 'msg' : interpretedProgram += proc_string(p, registers); break;
        case 'call': st.push(mp); current = cmd[1]; pc = -1; break;
        case 'cmp' : condition = compare(cnd, registers, cmd); break;
        case 'jne' : if(condition){current = cmd[1]; pc = -1;} condition = false; break;
        case 'je' : if(condition){current = cmd[1]; pc = -1;} condition = false; break;
        case 'jge' : if(condition){ current = cmd[1]; pc = -1;} condition = false; break;
        case 'jle' : if(condition){current = cmd[1]; pc = -1;} condition = false; break;
        case 'jl' : if(condition){ current = cmd[1]; pc = -1;} condition = false; break;
        case 'jg' : if(condition){ current = cmd[1]; pc = -1;} condition = false; break;
        case 'ret' : current = undefined; mp = st.pop(); break;
    }
    
    if(current == undefined)
      mp++;
    else if(current != undefined)
    {
      pc++;
      if(functions[current][pc] == 'f')
        return -1;
    }
    else;
  }

  return interpretedProgram;
}

function proc_string(msg, regs)
{
  let res = "";
  msg = msg.substring(3, msg.length);
  let stringMode = false;
  for(let ptr = 0; ptr < msg.length; ptr++)
  {
    if(msg[ptr] == '\'')
      stringMode = !stringMode;
    else if(stringMode)
      res += msg[ptr];
    else if(msg[ptr] >= 'a' && msg[ptr] <= 'z')
      res += regs[msg[ptr]];
  }
  return res.trim();
}

function compare(cnd, registers, cmd)
{
  let bool = cmd[2] >= 'a' && cmd[2] <= 'z' ? registers[cmd[2]] : +cmd[2];
  if(cnd == "je" && registers[cmd[1]] == bool)
    return true;
  else if(cnd == "je")
     return false;
  else if(cnd == "jg" && registers[cmd[1]] > bool)
    return true;
  else if(cnd == "jg")
    return false;
  else if(cnd == "jge" && registers[cmd[1]] >= bool)
    return true;
  else if(cnd == "jge")
    return false;
  else if(cnd == "jl" && registers[cmd[1]] < bool)
    return true;
  else if(cnd == "jl")   
    return false;
  if(cnd == "jle" && registers[cmd[1]] <= bool)
    return true;
  else if(cnd == "jle")
    return false;
  else if(cnd == "jge" && registers[cmd[1]] >= bool)
    return true;
  else if(cnd == "jge")
    return false;
  else if(cnd == "jne" && registers[cmd[1]] != bool)
    return true;
  else if(cnd == "jne")
    return false;                           
}
