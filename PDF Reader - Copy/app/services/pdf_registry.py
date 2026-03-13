from app.database.mongodb import chunks_collection

def list_pdfs():

#Returns summary of PDFs in the database

    pipeline = [
        {
            "$group": {
                "_id": "$pdf_id",
                "pages": {"$addToSet": "$page"},
                "chunks": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "pdf_id": "$_id",
                "pages": {"$size": "$pages"},
                "chunks": 1
            }
        }
    ]

    return list(chunks_collection.aggregate(pipeline))
