import React, { useState } from 'react';
import { Upload, FileText, Image, Video, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from './services/apiService';

const FakeDetectorApp = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Gemini API integration for content analysis
  const analyzeContent = async (type, content) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      let analysisResult;
      
      switch (type) {
        case 'text':
          analysisResult = await apiService.analyzeText(content);
          break;
        case 'image':
          analysisResult = await apiService.analyzeImage(content);
          break;
        case 'video':
          analysisResult = await apiService.analyzeVideo(content);
          break;
        default:
          throw new Error('Unsupported content type');
      }

      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({ error: error.message || 'Analysis failed. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextAnalysis = () => {
    if (!inputText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }
    analyzeContent('text', inputText);
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      analyzeContent(type, file);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setInputText('');
    setUploadedFile(null);
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const ResultCard = ({ result }) => {
    if (result?.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{result.error}</p>
            </div>
          </div>
        </div>
      );
    }

    const isFake = result?.isFake;
    const confidence = result?.confidence;
    
    return (
      <div className={`border rounded-lg p-6 ${
        isFake 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          {isFake ? (
            <AlertTriangle className="text-red-500" size={32} />
          ) : (
            <CheckCircle className="text-green-500" size={32} />
          )}
          <div>
            <h3 className={`text-xl font-bold ${
              isFake ? 'text-red-800' : 'text-green-800'
            }`}>
              {isFake ? 'Likely Fake' : 'Likely Authentic'}
            </h3>
            <p className={`text-sm ${
              isFake ? 'text-red-600' : 'text-green-600'
            }`}>
              Confidence: {(confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        
        <div className={`w-full bg-gray-200 rounded-full h-2 mb-4`}>
          <div 
            className={`h-2 rounded-full ${
              isFake ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
        
        <p className={`text-sm ${
          isFake ? 'text-red-700' : 'text-green-700'
        }`}>
          {result?.reasoning}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Content Authenticity Detector
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload text, images, or videos to analyze their authenticity using advanced AI detection algorithms
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            <TabButton
              id="text"
              icon={FileText}
              label="Text Analysis"
              isActive={activeTab === 'text'}
              onClick={() => { setActiveTab('text'); resetAnalysis(); }}
            />
            <TabButton
              id="image"
              icon={Image}
              label="Image Analysis"
              isActive={activeTab === 'image'}
              onClick={() => { setActiveTab('image'); resetAnalysis(); }}
            />
            <TabButton
              id="video"
              icon={Video}
              label="Video Analysis"
              isActive={activeTab === 'video'}
              onClick={() => { setActiveTab('video'); resetAnalysis(); }}
            />
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Text Analysis */}
            {activeTab === 'text' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Enter text to analyze:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste news article, social media post, or any text content here..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={handleTextAnalysis}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Analyzing Text...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      <span>Analyze Text</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Image Analysis */}
            {activeTab === 'image' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors duration-200">
                    <Image size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload an image to analyze</p>
                    <p className="text-sm text-gray-500 mb-4">Supports JPEG, PNG, GIF files up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                      id="image-upload"
                      disabled={isAnalyzing}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Upload size={20} />
                      <span>Choose Image</span>
                    </label>
                  </div>
                  {uploadedFile && activeTab === 'image' && (
                    <p className="mt-3 text-sm text-gray-600">
                      Selected: {uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Video Analysis */}
            {activeTab === 'video' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors duration-200">
                    <Video size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload a video to analyze</p>
                    <p className="text-sm text-gray-500 mb-4">Supports MP4, AVI, MOV files up to 100MB</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                      id="video-upload"
                      disabled={isAnalyzing}
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Upload size={20} />
                      <span>Choose Video</span>
                    </label>
                  </div>
                  {uploadedFile && activeTab === 'video' && (
                    <p className="mt-3 text-sm text-gray-600">
                      Selected: {uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-3 bg-blue-50 px-6 py-4 rounded-lg">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <span className="text-blue-700 font-medium">
                    Analyzing content with AI detection algorithms...
                  </span>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results:</h3>
                <ResultCard result={result} />
                <button
                  onClick={resetAnalysis}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Analyze another file
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by Google Gemini AI for advanced content authenticity detection
          </p>
          <p className="mt-2">
            • Text Analysis • Image Manipulation Detection • Video Metadata Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default FakeDetectorApp;