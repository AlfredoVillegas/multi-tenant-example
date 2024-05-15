const DomainPage = ({
    params,
  }: {
    params: { domain: string };
  }) => {   
    const domain = decodeURIComponent(params.domain);
    return (  
        <div>
            <h1>Domain Page</h1>
            <p>{domain}</p>
        </div>
    );
}
 
export default DomainPage;