import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const maxRetries = 20;
  // Create state property
  const [input, setInput] = useState('');

  // need useState for Artist, Vibe, Medium, and Descriptors. these will be concatenated to form the input
  const [artistInput, setArtistInput] = useState('')
  const [mediumInput, setMediumInput] = useState('')
  const [vibeInput, setVibeInput] = useState('')
  const [descriptorInput, setDescriptorInput] = useState('')

  const [img, setImg] = useState('');
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value)
  }

  // Capture and set the additional input fields
  const onArtistChange = (event) => {
    setArtistInput(event.target.value)
    console.log(event.target.value)
  }

  const onMediumChange = (event) => {
    console.log(event.target.value)
    setMediumInput(event.target.value)
  }

  const onVibeChange = (event) => {
    console.log(event.target.value)
    setVibeInput(event.target.value)
  }

  const onDescriptorChange = (event) => {
    console.log(event.target.value)
    setDescriptorInput(event.target.value) 
  }

  const generateAction = async () => {
    console.log('Generating...')

    // check to make sure no double click
    if (isGenerating && retry === 0) return;

    setIsGenerating(true);
    
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0)
    }

    // Update this to concatenate all inputs 
    const concatenateInputs = `${mediumInput} intricate character portrait of klack as d&d character by ${artistInput}, ${descriptorInput}, ${vibeInput}, ${input}`
    const finalInput = concatenateInputs.replace(/kyle/gi, 'klack');

    // Add the fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input: finalInput }),
    });

    const data = await response.json();

    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }

    setFinalPrompt(finalInput);
    setInput('');
    setArtistInput('');
    setMediumInput('');
    setVibeInput('');
    setDescriptorInput('');
    setImg(data.image);
    setIsGenerating(false);
  };

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes`);
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>D&D picture generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>D&D picture generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Make some D&D portraits of me. Fill in the blanks, get a pic - you get the idea.</h2>
          </div>
          <div className='prompt-container'>
            <div className='sub-prompt-container'>
              <h2 className='sub-prompt-title'>Artist</h2>
              <input className='prompt-box' value={artistInput} onChange={onArtistChange} />
            </div>
            <div className='sub-prompt-container'>
              <h2 className='sub-prompt-title'>Medium</h2>
              <input className='prompt-box' value={mediumInput} onChange={onMediumChange} />
            </div>
            <div className='sub-prompt-container'>
              <h2 className='sub-prompt-title'>Vibe</h2>
              <input className='prompt-box' value={vibeInput} onChange={onVibeChange} />
            </div>
            <div className='sub-prompt-container'>
              <h2 className='sub-prompt-title'>Descriptor</h2>
              <input className='prompt-box' value={descriptorInput} onChange={onDescriptorChange} />
            </div>
            <div className='sub-prompt-container extra-details'>
              <h2 className='sub-prompt-title'>Extra details</h2>
              <input className='prompt-box' value={input} onChange={onChange}/>
            </div>
            <div className='prompt-buttons'>
              <a className={isGenerating ? 'generate-button loading' : 'generate-button'} onClick={generateAction}>
                <div className='generate'>
                  {isGenerating ? (
                    <span className='loader'></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className='output-content'>
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
